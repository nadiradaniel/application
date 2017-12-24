const signup = {
  data: function () {
    return {
      username: '',
      password: '',
    }
  },
  template: '<div><div class="row"><form class="col s6 offset-s3"> <div class="section"><div class="input-field col s6 offset-s3"><input id="username" type="text" class="validate" v-model="username"><label for="username">Username</label></div> </div><div class="section"><div class="input-field col s6 offset-s3"><input id="password" type="password" class="validate" v-model="password"><label for="password">Password</label></div></div></form></div><div class="section" style="text-align:center; margin:auto"><a class="waves-effect waves-light btn" v-on:click="signup">Sign up</a> <div class="section"> Already have a account? <a style="cursor:pointer" v-on:click="redirectToLogin">Sign in</a></div></div></div>',
  methods: {
    signup: function() {
      $.post("http://ec2-13-229-31-189.ap-southeast-1.compute.amazonaws.com:8000/signup/",
      {
        username: this.$data.username,
        password: this.$data.password
      }).done(function(data){
        router.push({ name: 'login'})
      }).fail(function(response){
        alert("Username: "+response.responseJSON.username+"\nPassword: "+response.responseJSON.password)
      })
    },
    redirectToLogin: function() {
      router.push({ name: 'login'})
    },
  },
}

const loginform = {
    data: function () {
      return {
        username: '',
        password: '',
      }
    },
    beforeRouteEnter: (to, from, next) => {
    next(loginform => {
      if(localStorage.getItem('token') != undefined && localStorage.getItem('token') != ""){
        router.push({name: 'home'})
      }
     })
    },
  template: '<div><div class="row"><form class="col s6 offset-s3"> <div class="section"><div class="input-field col s6 offset-s3"><input id="username" type="text" class="validate" v-model="username"><label for="username">Username</label></div> </div><div class="section"><div class="input-field col s6 offset-s3"><input id="password" type="password" class="validate" v-model="password"><label for="password">Password</label></div></div></form></div><div class="section" style="text-align:center; margin:auto"><a class="waves-effect waves-light btn" v-on:click="login">Sign in</a> <div class="section"> Not a member? <a v-on:click="redirectToSignup" style="cursor:pointer">Sign up</a></div></div></div>',
  methods: {
    login: function (item) {
      $.post("http://ec2-13-229-31-189.ap-southeast-1.compute.amazonaws.com:8000/login/",
      {
          username: this.$data.username,
          password: this.$data.password
      }).done(function(data){
          localStorage.setItem('token', data.token)
          router.push({ name: 'home'})
          location.reload()
      }).fail(function(response){
        alert("Username: "+response.responseJSON.username+"\nPassword: "+response.responseJSON.password)
      })
    },
    redirectToSignup: function (item) {
      router.push({ name: 'signup'})
    }
  }
}

const stores = {
    props: ['res'],
    template: '<div><table><thead><tr><th>{{res.name}}</th></tr></thead><tbody><tr><td>Phone</td><td>{{res.phone}}</td></tr><tr><td>Address</td><td>{{res.address}}</td></tr><tr><td>Type</td><td>{{res.type}}</td></tr><tr><td>Description</td><td>{{res.description}}</td></tr></tbody></table> <a v-on:click="back">Back to Home </a></div>',
    methods:{
      back: function(){
        router.push({name:'home'})
        location.reload()
      }
    }
}

const routes = [
  { path: '/stores', name:'home' },
  { path: '/login', component: loginform, name:'login' },
  { path: '/signup', component: signup, name:'signup'},
  { path: '/stores/:id', component: stores, name: 'stores', props: true }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
  router,
  mounted: function () {
    if(localStorage.getItem('token') == undefined) {
      router.push({ name: 'login'})
    }
    else{
      router.push({ name: 'home'})
    }
  },
}).$mount('#app')

const home = new Vue({
  router,
  beforeMount() {
    if(localStorage.getItem('token') == undefined || localStorage.getItem('token') == ""){
      router.push({name: 'login'})
    }
  },
  data: function() {
    return{
      current_page: 1,
      page_count: 0,
      count: 0,
      prev_page: '',
      next_page: '',
      results: [],
      token:''
    }
  },
  mounted: function (){
    this.token = localStorage.getItem('token')
    this.fetchData()
  },
  //template: '<div class="section"><a class="dropdown-button btn" href="#" data-activates="dropdown">Filter by Type</a><ul id="dropdown" class="dropdown-content"><li><a href="#!" v-on:click="filter(0)">cafe</a></li><li><a href="#!" v-on:click="filter(1)">dineout</a></li><li><a href="#!" v-on:click="filter(2)">delivery</a></li> </ul><table class="highlight" id="table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Address</th><th>Type</th><th>Description</th></tr></thead><tbody id="results"><tr v-for="res in results"> <td>{{res.id}}</td><td><a v-on:click="showDesc(res)"> {{res.name}} </a></td><td>{{res.phone}}</td><td>{{res.address}}</td><td>{{res.type}}</td><td>{{res.description}}</td></tr></tbody></table><ul class="pagination"></ul></div>',
  methods: {
    fetchData: function () { 
      $.get('http://ec2-13-229-31-189.ap-southeast-1.compute.amazonaws.com:8000/stores/',
        function(data, status){
          if(status == 'success') {
            home.count = data.count
            home.prev_page = data.previous
            home.next_page = data.next
            home.results = data.results
            home.page_count =  Math.ceil(home.count / 10)
            home.paginate()
          }
      });
    },
    logout: function () {
      localStorage.setItem('token', "")
      this.token = localStorage.getItem('token')
      router.push({name:'login'})
    },
    setPreviousButtonStatus: function () {
      if (home.current_page == 1) {
         $('.previous').addClass('disabled');
      } 
      else {
        $('.previous').removeClass('disabled');
      }
    },
    setNextButtonStatus: function () {
      if (home.current_page >= home.page_count) {
        $('.next').addClass('disabled');
      } 
      else {
        $('.next').removeClass('disabled');
      }
    },
    setActiveButtonStatus: function () {
      $('.pagination li').removeClass('disabled');
      $('.pagination li').removeClass('active');
      $('.pagination li:nth-child(' + (home.current_page + 1) + ')').addClass('active');
    },
    disablePaginationButtons: function () {
      $('.pagination li').addClass('disabled');
    },
    setButtonsStatus: function () {
      this.setActiveButtonStatus();
      this.setPreviousButtonStatus();
      this.setNextButtonStatus();
    },
    changePageData: function() {
      $.get('http://ec2-13-229-31-189.ap-southeast-1.compute.amazonaws.com:8000/stores?page='+this.$data.current_page,
        function(data, status){
          if(status == 'success') {
            home.count = data.count
            home.prev_page = data.previous
            home.next_page = data.next
            home.results = data.results
            home.page_count =  Math.ceil(home.count / 10)
            home.setButtonsStatus()
          }
      });
      //setButtonsStatus();
    },
    paginate: function (){
      var pagination = '<div class="center"><li class="previous"><a href="#!"><i class="material-icons">chevron_left</i></a></li>'
      for (var i = 1; i <= this.$data.page_count; i++) {
        pagination += '<li class="page-btn wave-effect"><a href="#' + i + '" v-on:click"page_num>' + i + '</a></li>'
      }
      pagination += '<li class="next wave-effect"><a href="#!"><i class="material-icons">chevron_right</i></a></li></div>'
      $('.pagination').append(pagination);
      home.setButtonsStatus()
      $('.previous a').click(function(e) {
        if (home.current_page > 1) {
          //this.disablePaginationButtons();
          home.current_page = home.current_page - 1;
          home.changePageData();
        }
      });
      $('.next a').click(function(e) {
        if (home.current_page < home.page_count) {
          console.log("hai")
          home.current_page = home.current_page + 1;
          home.changePageData();
        } 
      });
      $('.page-btn a').click(function(e) {
        home.current_page = parseInt($(this).text());
        home.changePageData();
      });
    },
    filter: function(value){
      var filter
      if (value == 0) {
        filter = 'cafe'
      }
      else if(value == 1){
        filter = 'dineout'
      }
      else{
        filter = 'delivery'
      }
      var tr = table.getElementsByTagName("tr");
      for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[4];
        if (td) {
          if (td.innerHTML.indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }       
      }
    },
    showDesc: function (res) {
      $('.section').css('display','none');
      router.push({ 
        name: 'stores',
        params: {
          id: res.id,
          res: res
        }
      })
    }
  },
}).$mount('#home')