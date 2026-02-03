import React from "react"
import ContactHero from "./components/ContactHero"
import ContactForm from "./components/ContactForm"
import ContactInfo from "./components/ContactInfo"
import "./styles/index.scss"

const page = () => {
  return (
    <div className="contact">
      <ContactHero />
      <div id="contact_container" className="contact_container">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  )
}
export default page

