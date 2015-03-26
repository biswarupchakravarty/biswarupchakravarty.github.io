(function () {

  var isDevelopment = window.location.toString().indexOf('localhost1') > -1,
    disqus_shortname = 'shinycoin';

  (function () {
    if (!window.md5) return;
    var gravatars = Array.prototype.slice.call(document.getElementsByClassName('post-avatar'));
    gravatars.forEach(function displayGravatar (gravatar) {
      gravatar.src = 'https://www.gravatar.com/avatar/' + md5(gravatar.dataset.email) + '?s=48&d=identicon&rating=pg';
    });
  });

  !isDevelopment && addEventListener('load', function () {
    Socialite.load();
  });

  !isDevelopment && addEventListener('load', function() {
    if (!document.getElementById('disqus_thread')) return;
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  });
  
}());