const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormTextArea =  document.querySelector('textarea')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
 const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Static variable
const TIME_FORMAT = 'H:mm'

socket.on('message', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format(TIME_FORMAT)
    })
    $messages.insertAdjacentHTML('beforeend', html)
    
})

socket.on('locationMessage', message => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format(TIME_FORMAT)
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
    console.log('roomData')
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', e => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value
    
    socket.emit('sendMessage', message, error => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormTextArea.value = ''
        $messageFormTextArea.focus()
        if(error) {
            return console.log(error)
        }
        console.log('The message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert('Geolocation is not supportet by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
        }, 
        () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})

socket.emit('join', { username, room }, error => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})