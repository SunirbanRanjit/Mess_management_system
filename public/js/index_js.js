
var u = "";
var date = "";
const msgerChat = document.querySelector(".main");
const btn_m = document.querySelector(".morning");
const btn_n = document.querySelector(".night");


//get username
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

async function getUser(){
    const token = getCookie('token');
    console.log(token);
    if( token === ""){
        //alert('Session expired!! \n Please login again...');
        window.location = '/login.html';
    }
    
        const response = await fetch('/authenticate' , {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        token
        })
    }).then((res) => res.json());

    console.log(response);

    if(response.state === 'ok'){
      display_name(response.username);
      document.getElementById("morning").checked=response.m_chk;
      document.getElementById("night").checked=response.n_chk;
      const dt = document.createElement("p");
      const node = document.createTextNode(`${response.date} Today's count:${response.count_morning} (Morning) ${response.count_night} (Night)`);
      dt.appendChild(node);
      document.getElementById("main").appendChild(dt);
      date = response.date;
      return response.username ;
    }
    if(response.state === 'error'){
        //alert(response.error);
        window.location  = './login.html';
    }
    return '';
  }

getUser().then(function(value) {u = value});
//console.log(user);


function display_name(user){
  const msgHTML = `
    <div class="header">
      <h2> ${user} </h2>

    </div>
  `;

  msgerChat.insertAdjacentHTML("beforebegin", msgHTML);
  
}


btn_m.addEventListener("change", chk);
btn_n.addEventListener("change", chk);

async function chk(event) {
    event.preventDefault();
    const morning = document.getElementById("morning").checked;
    const night = document.getElementById("night").checked;
    console.log(morning,night,date);
    const token = getCookie('token');
    const response = await fetch('/update' , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token, morning, night
      })
    }).then((res) => res.json());
    if(response.status === 'ok'){
      alert("Updated!!");
      //window.location = './login.html';
    }
    if(response.status === 'error')
      console.log(response.error);
}

//join chat
//socket.emit('join',user);
/*
var query = User.find();
query.count(function (err, count) {
    if (err) console.log(err)
    else console.log("Count is", count)
});*/