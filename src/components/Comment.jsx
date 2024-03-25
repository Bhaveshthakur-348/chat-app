import { RiDeleteBin5Line } from "react-icons/ri";

const Comment = ({comment, onDelete, onEdit, onReplyToggle, onReply, formatDate}) => {
  return (
    <div key={comment.id} className="mt-2">
    {/* Render comment content */}
    <div className="bg-gray-100 border border-1 p-4 rounded-md relative">
      <div className="font-semibold flex justify-between mb-[2px]">
        <p>{comment.name}</p>
        <p>{formatDate(comment.date)}</p>
      </div>
      <p className="mb-[2px]">{comment.comment}</p>
      <button
        className="p-1 absolute top-1/2 -translate-y-1/2 right-[-11px] rounded-full bg-gray-800"
        onClick={() => onDelete(comment.id, null)}
      >
        <RiDeleteBin5Line className="text-white h-5 w-5" />
      </button>
      <div className="flex justify-start">
        <button
          className="text-blue-500 font-semibold mr-3"
          onClick={() => onReplyToggle(comment.id)}
        >
          Reply
        </button>
        <button
          className="text-blue-500 font-semibold"
          onClick={() => onEdit("comment", comment.id)}
        >
          Edit
        </button>
      </div>
    </div>

    {/* Reply form */}
    {comment.replyVisible && (
      <form
        className="ml-6 p-4 bg-gray-100 mt-2 rounded-md border border-1 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          const replyName = e.target.elements.replyName.value;
          const replyText = e.target.elements.replyText.value;
          onReply(comment.id, replyText, replyName);
          e.target.reset();
        }}
      >
        <h1>Reply</h1>
        <input
          type="text"
          name="replyName"
          className="w-full rounded-md p-2 mt-2"
          placeholder="Name"
        />
        <input
          type="text"
          name="replyText"
          className="w-full rounded-md p-2 mt-2"
          placeholder="Reply"
        />
        <button
          type="submit"
          className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 self-end"
        >
          Post
        </button>
      </form>
    )}

    {/* Check if replies exist and if it's an array before mapping over it */}
    {comment.replies &&
      Array.isArray(comment.replies) &&
      comment.replies.map((reply) => (
        <div
          key={reply.id}
          className="bg-gray-100 border border-1 p-4 rounded-md mt-4 ml-6 mb-3 relative"
        >
          <div className="font-semibold flex justify-between mb-[2px]">
            <p>{reply.name}</p>
            <p>{formatDate(reply.date)}</p>
          </div>
          <p className="mb-[2px]">{reply.reply}</p>
          <button
            className="text-blue-500 font-semibold"
            onClick={() => onEdit("reply", comment.id, reply.id)}
          >
            Edit
          </button>
          <button
            className="p-1 absolute top-1/2 -translate-y-1/2 right-[-11px] rounded-full bg-gray-800"
            onClick={() => onDelete(comment.id, reply.id)}
          >
            <RiDeleteBin5Line className="text-white h-5 w-5" />
          </button>
        </div>
      ))}
  </div>
  );
};

export default Comment;