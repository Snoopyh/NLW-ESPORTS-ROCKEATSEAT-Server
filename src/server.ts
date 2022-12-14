import express from 'express'
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/convert-hours-strings-to-minutes'
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string'

const app = express()
app.use(express.json())
app.use(cors({}))
const prisma = new PrismaClient()

// HTTP methods / API RESTful / HTTP Codes

// GET, POST, PUT, PATCH, DELEDE

app.get('/games', async (resquest, response) =>{
  const games = await prisma.game.findMany({
    include: {
      _count:{
        select:{
          ads: true,
        }
      }
    }
  })

  return response.json(games)
});

app.post('/games/:id/ads', async (request, response) =>{
  const gameId = request.params.id;
  const body: any = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weakDays: body.weakDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad)
});


app.get('/games/:id/ads', async (request, response) =>{
  const gamesId = request.params.id;

  const ads = await prisma.ad.findMany({
    select:{
      id: true,
      name: true,
      weakDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where:{
      gameId: gamesId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return response.json(ads.map(ad => {
    return {
      ...ad,
      weakDays: ad.weakDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd),
    }
  }))
}); 

app.get('/ads/:id/discord', async (request, response) =>{
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where:{
      id: adId,
    }
  })

  return response.json({
    discord: ad.discord,
  })
});

app.listen(3333)
