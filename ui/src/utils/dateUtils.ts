import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string | Date, format = 'MMM D, YYYY') => {
  return dayjs(date).format(format);
};

export const formatFromNow = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const getTimeAgo = (date: string | Date) => {
  return dayjs(date).fromNow();
};
