require('dotenv').config()
const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const { executeQuery } = require('./services/execute.js')
require('./services/execute.js')
const app = express()

app.use(bodyParser.json())
app.use(cors())


const server = app.listen(process.env.PORT, function () {
    const port = server.address().port;
    console.log("Listening on PORT NUMBER", port);
})


app.post("/api/test", async function (req, res) {
    const age = req.body;
    const result = await executeQuery('SELECT * FROM crime_report')

    res.send(result)

})

// get's the complexQuery1 with codes
app.get("/api/get_complexQ1", async function (req, res) {
    const result = await executeQuery(`SELECT Area.area_code,Area.area_name, EXTRACT(YEAR FROM crime_report.date_rprtd) AS year, 
                                      CASE  WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (12, 1, 2) THEN 'Winter' 
                                      WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (3, 4, 5) THEN 'Spring'
                                      WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (6, 7, 8) THEN 'Summer'
                                      ELSE 'Fall'
                                      END AS season,
                                      COUNT(Crime_report.DR_NO) AS crime_count
                                      FROM
                                      Crime_report
                                      JOIN Area ON Crime_report.area_code = Area.area_code
                                      GROUP BY
                                      Area.area_code,
                                      Area.area_name,
                                      EXTRACT(YEAR FROM crime_report.date_rprtd),
                                      CASE
                                      WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (12, 1, 2) THEN 'Winter'
                                      WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (3, 4, 5) THEN 'Spring'
                                      WHEN EXTRACT(MONTH FROM crime_report.date_rprtd) IN (6, 7, 8) THEN 'Summer'
                                      ELSE 'Fall'
                                      END
                                      ORDER BY
                                      Area.area_code,
                                      EXTRACT(YEAR FROM crime_report.date_rprtd),
                                      season`)

    res.send(result)
})

// Complex Query 2 : How has the detection rate of theft-related crimes changed in specific districts over time?
app.get("/api/get_complexQ2", async function (req, res) {
    const result = await executeQuery(`SELECT 
        area_code,
        EXTRACT(YEAR FROM DATE_OCC) AS Year,
        SUM(
            CASE 
                WHEN STATUS IN ( 'AA', 'AO', 'JA', 'JO') THEN 1 
                ELSE 0 
            END
        ) AS Detected_Crimes,
        COUNT(*) AS Total_Crimes,
        Round((SUM(
            CASE 
                WHEN STATUS IN ( 'AA', 'AO', 'JA', 'JO') THEN 1 
                ELSE 0 
            END
        ) / COUNT(*)) * 100,2) AS Detection_Rate_Percentage
    FROM 
        Crime_report
    WHERE 
        CRIME_CODE IN (SELECT DISTINCT(cr.crime_code) 
                        FROM crime_report cr JOIN Crime_type ct ON cr.crime_code = ct.crime_code
                        WHERE LOWER(ct.crime_descr) LIKE '%theft%'
                        )
    GROUP BY 
        area_code, EXTRACT(YEAR FROM DATE_OCC)
    ORDER BY 
         area_code, EXTRACT(YEAR FROM DATE_OCC)
                                                          `)

    res.send(result)
})

app.get("/api/get_complexQ3", async function (req, res) {
    const result = await executeQuery(`SELECT 
                                      FLOOR(TIME_OCC / 100) AS Incident_Hour, 
                                      AREA_CODE, 
                                      COUNT(*) AS Incident_Count
                                    FROM 
                                      Crime_report
                                    GROUP BY 
                                      FLOOR(TIME_OCC / 100), 
                                      AREA_CODE
                                    ORDER BY 
                                      AREA_CODE, 
                                      Incident_Count DESC`)

    res.send(result)

})



app.get("/api/get_complexQ4", async function (req, res) {
    const result = await executeQuery(`SELECT 
                                        EXTRACT(YEAR FROM DATE_OCC) AS Year,
                                        CASE 
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (12, 1, 2) THEN 'Winter'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (3, 4, 5) THEN 'Spring'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (6, 7, 8) THEN 'Summer'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (9, 10, 11) THEN 'Autumn'
                                        END AS Season,
                                        CASE 
                                            WHEN VICT_AGE <= 17 THEN '0-17'
                                            WHEN VICT_AGE BETWEEN 18 AND 30 THEN '18-30'
                                            WHEN VICT_AGE BETWEEN 31 AND 45 THEN '31-45'
                                            WHEN VICT_AGE BETWEEN 46 AND 60 THEN '46-60'
                                            ELSE '61+'
                                        END AS Age_Group,
                                        AREA_CODE,
                                        COUNT(*) AS Victim_Count
                                    FROM 
                                        Crime_report
                                    GROUP BY 
                                        EXTRACT(YEAR FROM DATE_OCC),
                                        CASE 
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (12, 1, 2) THEN 'Winter'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (3, 4, 5) THEN 'Spring'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (6, 7, 8) THEN 'Summer'
                                            WHEN EXTRACT(MONTH FROM DATE_OCC) IN (9, 10, 11) THEN 'Autumn'
                                        END,
                                        CASE 
                                            WHEN VICT_AGE <= 17 THEN '0-17'
                                            WHEN VICT_AGE BETWEEN 18 AND 30 THEN '18-30'
                                            WHEN VICT_AGE BETWEEN 31 AND 45 THEN '31-45'
                                            WHEN VICT_AGE BETWEEN 46 AND 60 THEN '46-60'
                                            ELSE '61+'
                                        END,
                                        AREA_CODE
                                    ORDER BY 
                                        Year, Season, Age_Group, AREA_CODE`)

    res.send(result)
})

app.get("/api/get_complexQ5", async function (req, res) {
    const result = await executeQuery(`WITH YearlyWeaponCount AS (
                                                      SELECT 
                                                          EXTRACT(YEAR FROM DATE_OCC) AS Year,
                                                          AREA_CODE,
                                                          WEAPON_USED_CODE,
                                                          COUNT(*) AS Weapon_Count
                                                      FROM 
                                                          Crime_report
                                                      GROUP BY 
                                                          EXTRACT(YEAR FROM DATE_OCC), 
                                                          AREA_CODE, 
                                                          WEAPON_USED_CODE
                                                  )
                                                  SELECT 
                                                      a.Year,
                                                      a.AREA_CODE,
                                                      a.WEAPON_USED_CODE,
                                                      a.Weapon_Count AS Current_Year_Count,
                                                      b.Weapon_Count AS Previous_Year_Count,
                                                      a.Weapon_Count - COALESCE(b.Weapon_Count, 0) AS Year_Over_Year_Change
                                                  FROM 
                                                      YearlyWeaponCount a
                                                  LEFT JOIN 
                                                      YearlyWeaponCount b ON a.AREA_CODE = b.AREA_CODE 
                                                      AND a.WEAPON_USED_CODE = b.WEAPON_USED_CODE 
                                                      AND a.Year = b.Year + 1
                                                  ORDER BY 
                                                      a.Year, 
                                                      a.AREA_CODE, 
                                                      a.WEAPON_USED_CODE
                                                        `)

    res.send(result)
})


app.get("/api/get_areas", async function (req, res) {
    const result = await executeQuery(`SELECT * FROM Area`)

    res.send(result)

})

app.get("/api/get_weapons", async function (req, res) {
    const result = await executeQuery(`SELECT * FROM Weapon`)

    res.send(result)

})


app.get("/api/get_recordEachYear", async function (req, res) {
    const result = await executeQuery(`SELECT EXTRACT(YEAR FROM DATE_OCC) AS Year, COUNT(*) AS Total_Crimes
FROM Crime_report
GROUP BY EXTRACT(YEAR FROM DATE_OCC)
ORDER BY Year
`)

    res.send(result)

})
app.get("/api/get_recordCount", async function (req, res) {
    const result = await executeQuery(`SELECT Count(*) AS TotalCount from crime_report`)

    res.send(result)

})
app.get("/api/get_areaCount", async function (req, res) {
    const result = await executeQuery(`SELECT AREA_CODE, COUNT(*) AS Total_Crimes
FROM Crime_report
GROUP BY AREA_CODE
ORDER BY Total_Crimes DESC
`)

    res.send(result)

})
app.get("/api/get_weaponCount", async function (req, res) {
    const result = await executeQuery(`SELECT WEAPON_USED_CODE, COUNT(*) AS Total_Crimes
                                            FROM Crime_report
                                            GROUP BY WEAPON_USED_CODE
                                            ORDER BY Total_Crimes DESC
                                            
                                            `)

    res.send(result)

})
