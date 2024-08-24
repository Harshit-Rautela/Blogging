import React from 'react'
import Header2 from './Header/Header2'
import Footer from './Footer/Footer'
import LandingPage from './LandingPage'
import { Link } from 'react-router-dom'

const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <LandingPage/>
      </main>
    <Footer />
  </div>
  )
}

export default MainPage