import React from "react"
import Image from "next/image"
import arrowIcon from "/src/assets/images/icon/right-arrow.png"
import "./style.scss"

export const Circle = ({ className }) => {
  return (
    <div className={`circle ${className}`}>
      <div className="circle__text">Ứng tuyển ngay</div>
      <div className="circle__icon">
        <Image className="circle__icon_arrow" alt="Arrow" src={arrowIcon} />
      </div>
    </div>
  )
}
