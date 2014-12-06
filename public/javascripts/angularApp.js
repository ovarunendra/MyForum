/**
 * Created by varun on 6/12/14.
 */
angular.module('myForum', ['ui.router'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'partials/home.html',
                    controller: 'MainCtrl as ctrl',
                    resolve: {
                        postPromise: ['posts', function(posts){
                            return posts.getAll();
                        }]
                    }
                })
                .state('posts', {
                    url: '/posts/{id}',
                    templateUrl: 'partials/posts.html',
                    controller: 'PostsCtrl as postCtrl',
                    resolve: {
                        post: ['$stateParams', 'posts', function($stateParams, posts) {
                            return posts.getComment($stateParams.id);
                        }]
                    }
                });
            $urlRouterProvider.otherwise('home');
        }])
    .factory('posts', ['$http',function($http){
        var obj = {
            posts: []
        };
        obj.getAll = function() {
            return $http.get('/posts').success(function(data){
                angular.copy(data, obj.posts);
            });
        };
        obj.create = function(post) {
            return $http.post('/posts', post).success(function(data){
                obj.posts.push(data);
            });
        };
        obj.upvote = function(post) {
            return $http.put('/posts/' + post._id + '/upvote')
                .success(function(data){
                    post.upvotes += 1;
                });
        };
        obj.getComment = function(id) {
            return $http.get('/posts/' + id).then(function(res){
                return res.data;
            });
        };
        obj.addComment = function(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };
        obj.upvoteComment = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
                .success(function(data){
                    comment.upvotes += 1;
                });
        }
        obj.downvoteComment = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/downvote')
                .success(function(data){
                    comment.downvotes += 1;
                });
        };
        return obj;
    }])
    .controller('MainCtrl',['posts',function(posts){
        var ctrl = this;
        ctrl.posts = posts.posts;
        ctrl.addPost = function(){
            if(!ctrl.title || ctrl.title === '') { return; }
            posts.create({
                title: ctrl.title,
                question: ctrl.question
            });
            ctrl.title = '';
            ctrl.question = '';
        };
        ctrl.incrementUpvotes = function(post){
            posts.upvote(post);
        };
    }])
    .controller('PostsCtrl', [
        '$stateParams',
        'posts',
        'post',
        function($stateParams, posts, post){
            var postCtrl = this;
            postCtrl.post = post;
            postCtrl.addComment = function(){
                if(postCtrl.body === '') { return; }
                posts.addComment(post._id, {
                    body: postCtrl.body,
                    author: 'user'
                }).success(function(comment) {
                    postCtrl.post.comments.push(comment);
                });
                postCtrl.body = '';
            };
            postCtrl.incrementUpvotes = function(comment){
                posts.upvoteComment(post, comment);
            };
            postCtrl.incrementDownvotes = function(comment){
                posts.downvoteComment(post, comment);
            };
        }]);
