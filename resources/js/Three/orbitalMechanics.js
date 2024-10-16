// Kepler's Equation Solver (Newton-Raphson method)
function solveKepler(meanAnomaly, eccentricity, tolerance = 1e-6) {
    let E = meanAnomaly; // Initial guess for Eccentric Anomaly
    let delta;
    do {
        delta = E - eccentricity * Math.sin(E) - meanAnomaly;
        E -= delta / (1 - eccentricity * Math.cos(E)); // Newton-Raphson step
    } while (Math.abs(delta) > tolerance);
    return E;
}

// Convert mean anomaly to true anomaly
export function meanAnomalyToTrueAnomaly(meanAnomaly, eccentricity) {
    const E = solveKepler(meanAnomaly, eccentricity); // Solve for Eccentric Anomaly
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
    );
    return trueAnomaly;
}