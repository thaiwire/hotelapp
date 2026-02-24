import dayjs from "dayjs"

export const getDateFormat = (
  value?: string | Date | null,
  format = "DD MMM YYYY"
) => {
  if (!value) {
    return "N/A"
  }

  return dayjs(value).format(format)
}

export const getTimeFormat = (
  value?: string | Date | null,
  format = "hh:mm A"
) => {
  if (!value) {
    return "N/A"
  }

  return dayjs(value).format(format)
}
