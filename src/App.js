import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
    const [countries, setCountries] = useState([])
    const [country, setCountry] = useState('Worldwide')
    const [countryInfo, setCountryInfo] = useState({})
    const [tableData, setTableData] = useState([])
    const [mapCenter, setMapCenter] = useState([20, 77]);
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState('cases');

    useEffect(() => {
        fetch('https://disease.sh/v3/covid-19/all')
            .then(response => response.json())
            .then(data => {
                setCountryInfo(data)
            })
    }, [])

    useEffect(() => {
        const getCountriesData = async () => {
            await fetch('https://disease.sh/v3/covid-19/countries')
                .then(response => response.json())
                .then(data => {
                    const countries = data.map(item => ({
                        name: item.country,
                        value: item.countryInfo.iso2
                    }))
                    setCountries(countries)
                    setMapCountries(data)
                    sortData(data)
                    setTableData(data)
                })
        }
        getCountriesData()

    }, [])

    const onCountryChange = async (e) => {
        const countryCode = e.target.value;
        setCountry(countryCode)
        const url = countryCode === "Worldwide" ?
            'https://disease.sh/v3/covid-19/countries' :
            `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
            .then(response => response.json())
            .then(data => {
                setCountryInfo(data)
                setMapCenter([data.countryInfo.lat, data.countryInfo.long])
                setMapZoom(4)
            })

    }
    return (
        <div className="app">
            <div className="app__left">
                <div className="app__header">
                    <h1>COVID-19 Tracker</h1>
                    <FormControl className="app__dropdown">
                        <Select variant="outlined" value={country} onChange={onCountryChange}>
                            <MenuItem value="Worldwide">Worldwide</MenuItem>
                            {
                                countries.map((item) => (
                                    <MenuItem value={item.value}>{item.name}</MenuItem>

                                ))
                            }
                        </Select>
                    </FormControl>
                </div>

                <div className="app__stats">
                    <InfoBox
                        isRed
                        active={casesType === "cases"}
                        className="infoBox__cases"
                        onClick={() => setCasesType('cases')}
                        title="Coronovirus Cases"
                        cases={prettyPrintStat(countryInfo.todayCases)}
                        total={prettyPrintStat(countryInfo.cases)}
                    />
                    <InfoBox
                        active={casesType === "recovered"}
                        className="infoBox__recovered"
                        onClick={() => setCasesType('recovered')}
                        title="Recovered"
                        cases={prettyPrintStat(countryInfo.todayRecovered)}
                        total={prettyPrintStat(countryInfo.recovered)}
                    />
                    <InfoBox
                        isGrey
                        active={casesType === "deaths"}
                        className="infoBox__deaths"
                        onClick={() => setCasesType('deaths')}
                        title="Deaths"
                        cases={prettyPrintStat(countryInfo.todayDeaths)}
                        total={prettyPrintStat(countryInfo.deaths)}
                    />
                </div>

                <Map
                    casesType={casesType}
                    countries={mapCountries}
                    center={mapCenter}
                    zoom={mapZoom}
                />
            </div>

            <Card className="app__right">
                <CardContent>
                    <h3>Live Cases by Country</h3>
                    <Table countries={tableData} />
                    <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
                    <LineGraph className="app__graph" casesType={casesType} />
                </CardContent>
            </Card>

        </div>
    )
}

export default App;