import React from 'react'

export const Search = ({ SearchTerm, setSearchTerm }) => {
    return (
        <div className="search">
            <div className="search-container">
                <img src='/search-icon.svg' alt="search" />
                <input
                    type='text'
                    placeholder='Search thousands of movies'
                    value={SearchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
    )
}