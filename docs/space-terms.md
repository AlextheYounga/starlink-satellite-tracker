# Satellite Telemetry Notes

## Key Telemetry Terms

- **EPOCH**:  
  *Timestamp representing the exact time when the satellite’s position and velocity were recorded.*  
  Example: `2020-10-01T07:31:19.437888`

- **MEAN_MOTION**:  
  *The number of orbits the satellite completes per day. Higher values indicate faster orbits.*  
  Example: `16.46847225` orbits/day

- **ECCENTRICITY**:  
  *Defines the shape of the orbit. A value of 0 represents a perfect circle, while values closer to 1 indicate an elliptical orbit.*  
  Example: `0.00090410` (almost circular)

- **INCLINATION**:  
  *The angle between the satellite’s orbital plane and the Earth's equatorial plane. It determines the range of latitudes the satellite passes over.*  
  Example: `52.9736` degrees

- **RA_OF_ASC_NODE**:  
  *(Right Ascension of the Ascending Node) The point where the satellite crosses the equatorial plane heading north, measured as an angle.*  
  Example: `36.3928` degrees

- **ARG_OF_PERICENTER**:  
  *The angle from the ascending node to the point of closest approach (perigee) in the orbit.*  
  Example: `295.9879` degrees

- **MEAN_ANOMALY**:  
  *The satellite’s position along its orbit at the given epoch time, expressed as an angle.*  
  Example: `160.3065` degrees

- **BSTAR**:  
  *A parameter that accounts for atmospheric drag affecting the satellite's orbit. Higher values indicate more drag.*  
  Example: `0.00018159000000`

- **MEAN_MOTION_DOT**:  
  *The rate of change in the satellite’s mean motion, showing how quickly its orbit is evolving over time.*  
  Example: `0.09808971`

- **MEAN_MOTION_DDOT**:  
  *The acceleration of the mean motion, indicating if the rate of change is itself increasing or decreasing.*  
  Example: `0.0000126230000`

- **SEMIMAJOR_AXIS**:  
  *Half of the longest diameter of the satellite’s orbit. For near-circular orbits, this value approximates the average distance from the Earth’s center.*  
  Example: `6525.788` km

- **PERIOD**:  
  *The time (in minutes) it takes for the satellite to complete one full orbit.*  
  Example: `87.439` minutes

- **APOAPSIS**:  
  *The farthest point in the satellite’s orbit from Earth.*  
  Example: `153.553` km

- **PERIAPSIS**:  
  *The closest point in the satellite’s orbit to Earth.*  
  Example: `141.753` km

- **REV_AT_EPOCH**:  
  *The number of complete orbits (revolutions) the satellite has made around the Earth at the specified epoch time.*  
  Example: `7697` orbits


## Key Components for Orbital Tracking

1. **EPOCH**: `DATETIME` `"2024-10-02T22:36:15.901344"`  
   - This timestamp serves as the reference time for when the satellite’s position and velocity were last known. All further calculations are propagated from this epoch.

2. **MEAN_MOTION**: `DECIMAL` (orbits per day)
   - This tells us how many orbits the satellite completes per day. With this value, we can derive the satellite’s period (which is 94.51 minutes).

3. **INCLINATION**: `DECIMAL` (degrees)
   - This indicates the angle between the satellite’s orbit and the Earth’s equatorial plane. A value near 97 degrees suggests it is in a **Sun-synchronous orbit**.

4. **RA_OF_ASC_NODE**: `DECIMAL` (degrees)
   - This is the **Right Ascension of the Ascending Node (RAAN)**, specifying where the satellite crosses the equatorial plane going north.

5. **ARG_OF_PERICENTER**: `DECIMAL` (degrees)
   - This defines the orientation of the satellite’s closest approach (perigee) relative to the RAAN.

6. **MEAN_ANOMALY**: `DECIMAL` (degrees)
   - This tells us the satellite’s position along its orbit at the epoch time, expressed as an angle.

7. **ECCENTRICITY**: `DECIMAL`
   - This indicates how circular or elliptical the orbit is. If the value is very small, the orbit is nearly circular.

8. **TLE Lines**:  
   ```
   TLE_LINE1: "1 61235U 24173J   24276.94185071  .00044548  00000-0  18438-2 0  9991"
   TLE_LINE2: "2 61235  97.3766 350.1967 0018166 145.3137 214.9289 15.23647602  1275"
   ```
   - These **Two-Line Elements (TLE)** provide all the necessary data for tracking software like **SGP4 propagators** to predict the satellite's current position and velocity accurately.
