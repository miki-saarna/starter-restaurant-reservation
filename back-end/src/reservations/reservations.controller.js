const service = require('./reservations.service');

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date } = req.query;
  if (date) {
    const data = await service.readByDate(date)
    res.json({ data })
  } else {
    const data = await service.list();
    res.json({ data });
  }
}

async function create(req, res, next) {
  const { data } = req.body;
  // console.log(data)
  const presentDateUTC = new Date();
  // get timezone offset in ms
  const timezoneOffset = presentDateUTC.getTimezoneOffset() * 60000;
  // get present date/time with timezone consideration
  // use getTime() method to convert to ms, which will allow us to subtract the timezoneOffset
  const presentDate = new Date(presentDateUTC.getTime() - timezoneOffset);


  // separate year, month, day
  const dateArray = data.reservation_date.split('-')
  // new Date() format requires month index, which is 0 indexed
  dateArray[1] -= 1;
  // separate hour, minute, second
  const timeArray = data.reservation_time.split(':')

  const reservationDateUTC = new Date(...dateArray, ...timeArray);
  // get reservation date/time with timezone consideration
  // use getTime() method to convert to ms, which will allow us to subtract the timezoneOffset
  const reservationDate = new Date(reservationDateUTC.getTime() - timezoneOffset)

  
  // validation if reservation date is in the past
  if (reservationDate - presentDate < 0) {
    return next({ status: 400, message: `Reservation date and time cannot be for a past date.`})
  }

  // validation if reservation is on a tuesday
  if (reservationDate.getDay() === 2) {
    return next({ status: 400, message: `Our restaurant is closed on Tuesday to allow the employees time to rest and enjoy their day.`})
  }

  // validation if reservation is not during open hours
  const reservationTime = data.reservation_time;  
  if (reservationTime < '10:30:00') {
    return next({ status: 400, message: `The restaurant does not open until 10:30 AM.`})
  }

  if (reservationTime > '21:30:00') {
    return next({ status: 400, message: `Please make a reservation at least 1 hour prior to closing. The restaurant closes at 10:30 PM.`})
  }
  
  newReservation = await service.create(data);
  res.status(201).json({ data: newReservation })
}

async function destroy(req, res) {
  const reservationId = parseInt(req.params.reservationId);
  await service.destroy(reservationId);
  res.sendStatus(204);
}

module.exports = {
  list,
  create,
  delete: destroy
};