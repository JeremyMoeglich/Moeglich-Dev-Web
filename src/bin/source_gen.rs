use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tokio::fs as async_fs;
use tokio::io::AsyncWriteExt;
use walkdir::WalkDir;

#[derive(Serialize, Deserialize)]
struct SourceFile {
    original_path: String,
    original_name: String,
    new_path: String,
    web_path: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let src_path = "./src";
    let dest_path = "./public/source";
    let mut sources: Vec<SourceFile> = Vec::new();

    // Delete the old source files
    if Path::new(dest_path).exists() {
        fs::remove_dir_all(dest_path)?;
    }

    for entry in WalkDir::new(src_path) {
        let entry = entry?;
        let path = entry.path();
        let ext = path.extension().and_then(|os_str| os_str.to_str());

        if let Some(extension) = ext {
            if extension == "ts" || extension == "tsx" {
                let original_path = path.to_string_lossy().to_string();
                let original_name = path.file_name().unwrap().to_string_lossy().to_string();

                let new_ext = format!("txt");
                let relative_path = path.strip_prefix("./src")?.with_extension(&new_ext);
                let dest_file_path = format!("{}/{}", dest_path, relative_path.display());
                let new_path = format!("/public/source/{}", relative_path.display());
                let web_path = format!("/source/{}", relative_path.display());

                // create a new SourceFile struct and push it to the sources Vec
                let source_file = SourceFile {
                    original_path: original_path.replace("\\", "/"),
                    original_name,
                    new_path: new_path.replace("\\", "/"),
                    web_path: web_path.replace("\\", "/")
                };
                sources.push(source_file);

                // creating parent directory if it does not exist
                if let Some(parent) = Path::new(&dest_file_path).parent() {
                    fs::create_dir_all(parent)?;
                }

                // copying file
                tokio::fs::copy(path, &dest_file_path).await?;
            }
        }
    }

    let sources_content = format!(
        "export interface SourceFile{{original_path:string;original_name:string;new_path:string;web_path:string}}export const sources: SourceFile[] = {};",
        serde_json::to_string(&sources)?
    );

    // Write to the sources.ts file
    let mut sources_file = async_fs::File::create("./src/code/sources.ts").await?;
    sources_file.write_all(sources_content.as_bytes()).await?;

    Ok(())
}
