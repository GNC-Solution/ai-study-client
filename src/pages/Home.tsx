import React from 'react'
import Header from '../components/home/Header'
import NavigationBar from '../components/NavigationBar'
import About from '../components/home/About'

export default function Home() {

  return (
    <div>
      <NavigationBar />
      <Header />
      <About/>
      
    </div>
  )
}
