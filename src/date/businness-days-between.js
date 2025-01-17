import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"

dayjs.extend(isBetween)

/**
 * Returns the number of business days between two dates, given a list of non-working days.
 * @param {Date} startDate The start date
 * @param {Date} endDate The end date
 * @param {Date[]} nonWorkingDays The list of non-working days
 * @return {number} The number of business days between the two dates.
 */
export const businessDaysBetween = (startDate, endDate, nonWorkingDays) => {
  if (dayjs(startDate).isSame(dayjs(endDate), "day")) {
    return 0
  }
  const difference = dayjs(endDate).diff(dayjs(startDate), "day")
  const numberOfWeeks = dayjs(endDate).diff(dayjs(startDate), "week")
  const nonWorkingDaysBetween = nonWorkingDays.filter((day) => dayjs(day).isBetween(dayjs(startDate), dayjs(endDate), "day", "[]"))
  return difference - numberOfWeeks * 2 - nonWorkingDaysBetween.length - 1
}
