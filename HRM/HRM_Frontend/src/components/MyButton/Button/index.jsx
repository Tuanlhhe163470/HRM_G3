import { Button as AntButton } from "antd"

export default function Button(props) {
  const dataProps = { ...props }
  const {
    // iconName,
    // children,
    //btnType,
    // className,
    // clsName,
    // size,
    // minWidthDefault,
    // disabled,
    // onClick,
    // alowDisabled,
    // styleIcon,
    // fill,
    // shape,
  } = props
  delete dataProps.btnType
  delete dataProps.className
  delete dataProps.clsName
  delete dataProps.iconName
  delete dataProps.size
  delete dataProps.minWidthDefault
  delete dataProps.disabled
  delete dataProps.onClick
  delete dataProps.alowDisabled

  return <AntButton {...props}>{props?.children}</AntButton>
}
