import { useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import CommentForm from "../comments/CommentForm";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

function PostItem({
  post: {
    id: postId,
    user_id: posterId,
    profiles,
    title,
    content,
    created_at,
    comment_amount,
  },
  session,
}) {
  const supabase = createClientComponentClient();
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const userId = session?.user?.id;
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const toggleComments = useCallback(() => {
    const newVisibility = !commentsVisible;
    setCommentsVisible(newVisibility);
    if (newVisibility) fetchComments();
  }, [commentsVisible]);

  const navigateToProfile = () => {
    if (userId != posterId) router.push(`/profile_viewer?userId=${posterId}`);
    else router.push("/profile");
  };
  const navigateToProfileComment = (profileId) => {
    if (userId !== profileId) {
      router.push(`/profile_viewer?userId=${profileId}`);
    } else {
      router.push("/profile");
    }
  };
  const formatTimestamp = (timestamp) => {
    const postDate = new Date(timestamp);
    const currentDate = new Date();

    if (
      postDate.getFullYear() === currentDate.getFullYear() &&
      postDate.getMonth() === currentDate.getMonth() &&
      postDate.getDate() === currentDate.getDate()
    ) {
      return postDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (currentDate - postDate < 365 * 24 * 60 * 60 * 1000) {
      return postDate.toLocaleString([], {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return postDate.toLocaleDateString();
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username, id)")
        .eq("post_id", postId);
      if (error) throw error;

      const commentsWithFormattedTimestamp = data.map((comment) => ({
        ...comment,
        created_at: formatTimestamp(comment.created_at),
      }));

      setComments(commentsWithFormattedTimestamp);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const response = await supabase
        .from("likes")
        .select("*", { count: "exact" })
        .eq("post_id", postId);

      const { data, error, count } = response;

      if (error) throw error;

      setLikeCount(count);

      const likedByUser = data.some((like) => like.user_id === userId);
      setLiked(likedByUser);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [postId]);

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);

    if (newLikedState) {
      // Add a like
      const { error } = await supabase
        .from("likes")
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) {
        console.error("Error adding like:", error);
      } else {
        setLikeCount(likeCount + 1);
      }
    } else {
      // Remove a like
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing like:", error);
      } else {
        setLikeCount(likeCount - 1);
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2">
          {/* Username */}
          <div
            className="text-lg font-semibold text-white hover:text-blue-500 cursor-pointer"
            onClick={() => navigateToProfile(profiles.id)}
          >
            {profiles.username}
          </div>
          {/* Timestamp */}
          <div className="text-sm text-gray-400">{created_at}</div>
        </div>
        {/* Title */}
        <p className="text-lg text-gray-300 mb-2 break-words">{title}</p>
        {/* Content */}
        <p className="border border-gray-700 rounded-md p-3 text-base bg-gray-800 text-gray-200 mb-4 break-words">
          {content}
        </p>
        {/* Comment toggle */}
        <div className="flex items-center mb-4">
          <button
            className="text-sm rounded-full hover:bg-green-400 hover:text-black bg-blue-600 border border-blue-800 p-2 w-10 h-10 flex items-center justify-center"
            onClick={toggleComments}
          >
            <FontAwesomeIcon icon={faComment} size="lg" />
          </button>
          <p className="text-sm text-gray-400 ml-2">{comment_amount}</p>
          {/* Like button */}
          <button
            className={`ml-4 text-sm rounded-full p-2 w-10 h-10 flex items-center justify-center ${
              liked
                ? "text-red-500 bg-red-500 hover:bg-red-700"
                : "text-gray-500 bg-gray-500 hover:bg-gray-700"
            } hover:text-black`}
            onClick={handleLike}
          >
            <FontAwesomeIcon icon={faHeart} size="lg" />
          </button>
          <p className="text-sm text-gray-400 ml-2">{likeCount}</p>
        </div>

        {/* Comment list */}
        {commentsVisible &&
          comments.map(({ id, profiles, content, created_at }) => (
            <div key={id} className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <a
                  className="text-base font-semibold text-gray-200 hover:text-blue-500 cursor-pointer"
                  onClick={() => navigateToProfileComment(profiles.id)}
                >
                  {profiles?.username || "Anonymous"}
                </a>
                <div className="text-sm text-gray-400">{created_at}</div>
              </div>
              <p className="border border-gray-700 rounded-md p-3 text-base bg-gray-800 text-gray-200">
                {content}
              </p>
            </div>
          ))}
        {/* Comment form */}
        {commentsVisible && (
          <CommentForm
            postId={postId}
            userId={userId}
            onCommentSubmit={fetchComments}
          />
        )}
      </div>
    </div>
  );
}

export default PostItem;
