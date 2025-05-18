import React, { useState } from 'react'

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(1)

  const handleFeedbackChange = (e) => setFeedback(e.target.value)
  const handleRatingChange = (e) => setRating(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Feedback: ${feedback}, Rating: ${rating}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="feedback">Feedback:</label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={handleFeedbackChange}
          rows="4"
          cols="50"
        />
      </div>
      <div>
        <label htmlFor="rating">Rating:</label>
        <select id="rating" value={rating} onChange={handleRatingChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}

export default FeedbackForm