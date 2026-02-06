import moment from "moment"

export const fomatTimeFromNow = time => {
  //   const time = moment()
  //   return moment(time).fromNow()
  if (!(moment(time).diff(moment(), "days") < 0)) return moment(time).fromNow()
  else return moment(time).format("DD/MM/YYYY")
}
