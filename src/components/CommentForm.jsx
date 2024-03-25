const CommentForm = ({ onSubmit }) => {
  return (
          <div className="bg-gray-100 p-4 rounded-md mb-4 border border-1">
        <form onSubmit={onSubmit}>
          <p className="text-lg mb-1 font-semibold">Comment</p>
          <input type="text" name="name" className="w-full rounded-md p-2 mb-4" placeholder="Name" />
          <textarea name="comment" className="w-full rounded-md p-2 mb-4" placeholder="Comment" rows={2} />
          <button type="submit"
            className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded float-right"
          >
            Post
          </button>
        </form>
      </div>
  )
}

export default CommentForm