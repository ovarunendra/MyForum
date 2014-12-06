/**
 * Created by varun on 6/12/14.
 */
var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    question: String,
    upvotes: {type: Number, default: 0},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});
PostSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};

mongoose.model('Post', PostSchema);