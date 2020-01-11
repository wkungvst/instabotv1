import * as nodeschedule from 'node-schedule';
import * as moment from 'moment';
import { Browser } from 'src/common/interfaces';
import { jobs, Job } from './jobs';

const getMilisecondsFromMinutes = (minutes: number) => minutes * 60000;

const schedule = (jobs: Job[], browser: Browser) =>
  nodeschedule.scheduleJob('0 * * * *', () => {
  console.log('lets execute some schedules');
    const hour = moment().hour();

    console.log('Executing jobs for', moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));

    return jobs.forEach(job => {
      if (!job.validateRanges(hour)) {
       // return null;
      }

      const delayedMinutes = 1;//Math.floor(Math.random());
      console.log('delaying: ' + delayedMinutes);

      const cb = () => job.execute(browser);

      return setTimeout(cb, getMilisecondsFromMinutes(delayedMinutes));
    });
  });

export { schedule, jobs };
