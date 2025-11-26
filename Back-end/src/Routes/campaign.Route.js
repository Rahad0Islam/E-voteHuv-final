import { Router } from "express";
import { upload } from "../Middleware/Multer.Middleware.js";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";

import { countLikeDislike, posting, postList, reactEmoji, userComment, deletePost, deleteComment } from "../Controllers/campaign.controller.js";
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

export default router;