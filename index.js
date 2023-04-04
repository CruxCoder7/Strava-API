const express = require('express')
const cors = require('cors');

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const auth_link = "https://www.strava.com/oauth/token"


// strava o-auth screen
async function reAuthorize(req, res, next) {
    const dataPromise = await fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '105116',
            client_secret: 'da0535ca8814f8f7daa0b82577f28eecb7adff9f',
            code: '4b3e71c5a7832f2a6f320fde49f643975e3876d5',
            grant_type: 'authorization_code'
        })
    })
    const data = await dataPromise.json();
    console.log(data);
    req.refresh_token = data.refresh_token;
    next();
}

async function refreshToken(req, res, next) {
    const dataPromise = await fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '105116',
            client_secret: 'da0535ca8814f8f7daa0b82577f28eecb7adff9f',
            refresh_token: "2240d65366e58b21e07a2142c3bf9ae2cc66ea90",
            grant_type: 'refresh_token'
        })
    })
    const data = await dataPromise.json();
    console.log(data);
    req.access_token = data.access_token;
    next();
}

app.get("/exchange_token", (req, res) => {
    res.send("done");
})

app.get('/', reAuthorize, refreshToken, async (req, res) => {
    const activities_link = `https://www.strava.com/api/v3/activities?access_token=${req.access_token}`
    const dataPromise = await fetch(activities_link);
    const data = dataPromise.json();
    res.json({ data })
})

app.get('/createActivity', refreshToken, async (req, res) => {
    const activities_link = `https://www.strava.com/api/v3/activities?access_token=${req.access_token}`
    const dataPromise = await fetch(activities_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Test_Activity10',
            type: 'Running8',
            sport_type: 'Run',
            start_date_local: "2013-10-20T19:20:30+01:00",
            elapsed_time: 100,
        })
    })
    const response = await dataPromise.json()
    res.json({ response })
})

app.get('/getActivity/:id', refreshToken, async (req, res) => {
    const activityId = req.params.id;
    const activities_link = `https://www.strava.com/api/v3/activities/${activityId}?access_token=${req.access_token}`

    const dataPromise = await fetch(activities_link);
    const data = dataPromise.json();
    res.json({ data })
})

app.listen(3000, () => console.log('listening on 3000'))