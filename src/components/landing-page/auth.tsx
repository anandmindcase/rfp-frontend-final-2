import React from 'react'
import {UserButton } from '@clerk/nextjs'

const Auth = () => {
  return (
    <div className="absolute right-5 top-5">
      <UserButton />
  </div>
  )
}

export default Auth;
