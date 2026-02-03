"use client"
import React from "react"
import Image from "next/image"
import banner from "src/assets/images/Banner/banner-lien-he.png"
import SvgIcon from "src/components/SvgIcon"
import Button from "src/components/MyButton/Button"

const ContactHero = () => {
  const handleScrollDown = () => {
    document
      .getElementById("contact_container")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="contact_hero">
      <div className="contact_hero__scroll">
        <Button
          type="primary"
          shape="circle"
          className="contact_hero__scroll_button"
          onClick={handleScrollDown}
        >
          <SvgIcon
            className="contact_hero__scroll_icon"
            name="scroll_icon_contact"
          />
        </Button>
      </div>
      <div className="contact_hero__image_wrapper">
        <Image
          className="contact_hero__image"
          src={banner}
          alt="Banner"
          priority
        />
      </div>
      <div className="contact_hero__heading">
        <h1 className="contact_hero__title_primary">Cùng chúng tôi</h1>
        <h2 className="contact_hero__title_secondary">tạo nên sự thay đổi</h2>
      </div>
    </section>
  )
}

export default ContactHero

