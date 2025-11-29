import { Router } from "express";
import { upload } from "../Middleware/Multer.Middleware.js";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";

import { countLikeDislike, posting, postList, reactEmoji, userComment, deletePost, deleteComment, editPost, editComment, reactComment } from "../Controllers/campaign.controller.js";
const router =Router();

router.route('/posting').post(jwtVerification,
     upload.fields([
        {
           name:"picture",
           maxCount:10
        },
        {
           name:"video",
           maxCount:10
        }
    ]),posting
)
router.route('/comment').post(jwtVerification,userComment)
router.route('/getpostlist').get(jwtVerification,postList)
router.route('/likedislike').post(jwtVerification,reactEmoji)
router.route('/countReaction').get(jwtVerification,countLikeDislike)

// delete post and comment
router.route('/deletePost').delete(jwtVerification, deletePost)
router.route('/deleteComment').delete(jwtVerification, deleteComment)

// edit post/comment and comment reactions
router.route('/editPost').patch(jwtVerification,
  upload.fields([
    { name: 'picture', maxCount: 10 },
    { name: 'video', maxCount: 10 }
  ]),
  editPost
)
// Alias: allow POST for multipart edit as some clients have trouble with PATCH + FormData
router.route('/editPost').post(jwtVerification,
  upload.fields([
    { name: 'picture', maxCount: 10 },
    { name: 'video', maxCount: 10 }
  ]),
  editPost
)
router.route('/editComment').patch(jwtVerification, editComment)
router.route('/reactComment').post(jwtVerification, reactComment)

export default router;