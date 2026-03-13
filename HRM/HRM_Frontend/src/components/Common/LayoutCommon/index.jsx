const LayoutStyled = {
  display: "flex",
  justifyContent: "center",
  maxWidth: "1300px",
  width: "100%",
  margin: "auto",
  height: "100%",
  padding: "0px 20px",
}
const LayoutCommon = props => {
  return (
    <div style={LayoutStyled}>
      <div style={{ width: "100%" }} {...props}>
        {props?.children}
      </div>
    </div>
  )
}

export default LayoutCommon
