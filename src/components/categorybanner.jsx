import React from 'react'
import popImg from '../assets/pop.jpg'
import rockImg from '../assets/rock.jpg'
import partyImg from '../assets/party.jpg'
import romanceImg from '../assets/romance.jpg'
import energeticImg from '../assets/energetic.jpg'
import relaxingImg from '../assets/relaxing.jpg'
import jazzImg from '../assets/jazz.jpg'
import alternativeImg from '../assets/jazz.jpg'
import allImg from '../assets/all.jpg'


const bannerInfo = {
    All: {
      image: allImg,
      title: "All Music",
      description: "Enjoy a mix of all your favorite genres."
    },
    Pop: {
      image: popImg,
      title: "Pop Hits",
      description: "The most popular pop songs right now."
    },
    Rock: {
      image: rockImg,
      title: "Rock Vibes",
      description: "Feel the energy of modern rock anthems."
    },
    Party: {
      image: partyImg,
      title: "Party Time",
      description: "Get the party started with these high-energy tracks."
    },
    Romance: {
      image: romanceImg,
      title: "Romantic Tunes",
      description: "Love songs to set the mood."
    },
    Energetic: {
      image: energeticImg,
      title: "High Energy",
      description: "Stay pumped with these powerful beats."
    },
    Relaxing: {
      image: relaxingImg,
      title: "Chill & Relax",
      description: "Unwind with calm and peaceful music."
    },
    Jazz: {
      image: jazzImg,
      title: "Smooth Jazz",
      description: "Relax and unwind with jazz classics."
    },
    Alternative: {
      image: alternativeImg,
      title: "Alternative Edge",
      description: "Discover the best of indie and alternative music."
    }
  }

  const CategoryBanner = ({ category }) => {
    const info = bannerInfo[category] || {
      image: "/images/default.jpg",
      title: "Welcome",
      description: "Enjoy your music journey."
    }
  
    return (
      <div className="relative w-full md:h-[153px] lg:h-[280px] xl:h-[315px] overflow-hidden rounded-2xl">
        {/* Fullscreen background image */}
        <img
          src={info.image}
          alt={info.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
  
        {/* Optional dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
  
        {/* Content on top */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 text-white">
          <h2 className="text-4xl font-bold">{info.title}</h2>
          <p className="text-md text-gray-200">{info.description}</p>
        </div>
      </div>
    )
  }
  
  export default CategoryBanner