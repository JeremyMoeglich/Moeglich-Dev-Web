export function edge_random() {
    const min_dist = 0.01;
    // random function designed for tests
    const action = Math.random();
    if (action < 0.1) {
        return 0;
    } else if (action < 0.2) {
        return 1;
    } else if (action < 0.3) {
        return -1;
    } else if (action < 0.4) {
        // small number
        return ensure_distance(Math.random() * 0.01, min_dist);
    } else if (action < 0.6) {
        // small negative number
        return ensure_distance(Math.random() * -0.01, min_dist);
    } else if (action < 0.8) {
        // random rounded number
        return ensure_distance(Math.round(Math.random() * 50 - 25), min_dist);
    } else {
        // random number
        return ensure_distance(Math.random() * 50 - 25, min_dist);
    }
}

export function ensure_distance(num: number, min: number) {
    if (num < min && num > -min) {
        return num < 0 ? -min : min;
    } else {
        return num;
    }
}