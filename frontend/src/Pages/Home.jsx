import React from 'react'
import Filters from '../Components/Filters'
import Projects from '../Components/Projects'
import Tasks from '../Components/Tasks'

function Home() {
  return (
    <div id="home-main-container">

        <section id="filters-section">
              <Filters/>
              <Projects/>
        </section>

        <section id="tasks-section">
            <Tasks />
        </section>
      
    </div>
  )
}

export default Home
