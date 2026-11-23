import { DateTime } from 'luxon'

/** Formats an optional ISO timestamp, showing a dash when there is none (e.g. no transactions loaded). */
export const formatOptionalIsoDateTime = (isoTime: string | undefined) =>
  isoTime ? DateTime.fromISO(isoTime).toLocaleString(DateTime.DATETIME_SHORT) : '–'
