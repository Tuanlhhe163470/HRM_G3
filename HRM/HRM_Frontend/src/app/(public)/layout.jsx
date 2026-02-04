import Header from "@/components/Layout/Header/index.jsx"
import Footer from "@/components/Layout/Footer/index.jsx"


export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
