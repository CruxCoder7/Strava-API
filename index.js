const express = require('express')
const cors = require('cors');

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
const auth_link = "https://www.strava.com/oauth/token"

app.get("/getauthcode", async (req, res) => {
    res.redirect(`https://www.strava.com/oauth/authorize?client_id=105116&response_type=code&redirect_uri=http://localhost:3000/exchange_token&scope=read_all,profile:read_all,activity:read_all,activity:write,profile:write`);
})


async function reAuthorize(req, res, next) {
    const dataPromise = await fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '105116',
            client_secret: '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2',
            code: 'e1d6d9e5cc87bc82989469bba3e47d285600f364',
            grant_type: 'authorization_code'
        })
    })
    const data = await dataPromise.json();
    console.log(data);
    // req.refresh_token = data.refresh_token;
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
            client_secret: '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2',
            refresh_token: "2240d65366e58b21e07a2142c3bf9ae2cc66ea90",
            grant_type: 'refresh_token'
        })
    })
    const data = await dataPromise.json();
    console.log(data);
    req.access_token = data.access_token;
    next();
}


app.get("/exchange_token", async (req, res) => {
    console.log(req.query.code)
    const dataPromise = await fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '105116',
            client_secret: '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2',
            code: req.query.code,
            grant_type: 'authorization_code'
        })
    })
    const data = await dataPromise.json();
    console.log(data);

    res.send("done");

})

// app.get('/', async (req, res) => {
//     // const activities_link = `https://www.strava.com/api/v3/activities?access_token=${req.access_token}`
//     // const dataPromise = await fetch(activities_link);
//     // const data = dataPromise.json();
//     // res.json({ data })
//     let token = "90f48a4de121b45064bff44d5a79561f763fb872";

//     const link = `https://www.strava.com/api/v3/athlete/activities?access_token=${token}&after=1645581871`
//     try {
//         const dataPromise = await fetch(link);
//         const data = await dataPromise.json();
//         res.json({ data })
//     } catch (error) {
//         res.json(error)
//     }

//     // const stravaa = new strava.client('90f48a4de121b45064bff44d5a79561f763fb872');
//     // const load = await stravaa.athlete.listActivities({
//     //     before: 1645581871,
//     // });
//     // res.json(load)
// })

app.get('/createActivity', refreshToken, async (req, res) => {
    const activities_link = `https://www.strava.com/api/v3/activities?access_token=${req.access_token}`
    const dataPromise = await fetch(activities_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'New Act10142456712',
            type: 'Hike',
            sport_type: 'Hike',
            start_date_local: "2022-01-20T19:20:30+01:00",
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
    const data = await dataPromise.json();
    res.json({ data })
})

app.get('/webhook', (req, res) => {
    console.log(req.query);
    const hub = req.query["hub.challenge"]
    res.status(200).json({
        "hub.challenge": hub
    })
});

app.post('/webhook', async (req, res) => {
    console.log("webhook event received!", req.query, req.body);

    const activities_link = `https://www.strava.com/api/v3/activities/${req.body.object_id}?access_token=3c54607addf2e81f52d147462b1ca2d96da8bc52`
    const dataPromise = await fetch(activities_link);
    const data = await dataPromise.json();
    console.log(data);
    res.status(200).json({ data })
});

app.get('/', async (req, res) => {
    await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: '105116',
            client_secret: '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2',
            callback_url: 'https://0849-2406-7400-c6-844-b032-f2f9-f477-fe60.ngrok-free.app/v1/strava/webhook',
            verify_token: 'STRAVA'
        })
    })

    const url = new URL('https://www.strava.com/api/v3/push_subscriptions');
    url.searchParams.append('client_id', '105116');
    url.searchParams.append('client_secret', '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2');

    const data = await fetch(url)
    const val = await data.json();
    console.log(val);
})

app.get("/subs", async (req, res) => {
    const data = await fetch('https://www.strava.com/api/v3/push_subscriptions?client_id=105116&client_secret=055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2');
    const val = await data.json();
    res.json(val)
})


app.get("/del", async (req, res) => {
    const form = new FormData();
    form.append('client_id', '105116');
    form.append('client_secret', '055e5db9e4fa7a9bb901b930ec200e7cf71c9bb2');

    await fetch('https://www.strava.com/api/v3/push_subscriptions/242476', {
        method: 'DELETE',
        body: form
    });
    res.json({ msg: "done" })
})

app.listen(3000, () => console.log('listening on 3000'))