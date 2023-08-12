function lerp(start: number, end: number, t: number) {
    return (1-t) * start + end * t
}