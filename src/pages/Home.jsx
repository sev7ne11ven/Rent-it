import { Navbar, Main, Product, Footer, Chatbot } from "../components";
import Products from "./Products";

function Home() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '20px' }}>
        <Main />
        <Chatbot />
        <Products />
      </div>
    </>
  )
}

export default Home