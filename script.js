// SELECTORS
const navContainer = document.querySelector('.nav-container')
const searchBarHeader = document.querySelector('.search-bar-header')
const headerTitle = document.querySelector('.header-title')
const searchBar = document.querySelector('.search-bar')
const input = document.querySelector('.input')
const buttons = document.querySelectorAll('.search-button')
const results = document.querySelector('.results')
const paginationBtns = document.querySelector('.pagination .top')
const modal = document.querySelector('.modal')
const modalContent = document.querySelector('.modal-content')
const modalButtons = document.querySelectorAll('.modal-buttons span')
const modalClose = document.querySelector('.modal-close')
const body = document.querySelector('body')
const error = document.querySelector('.error-message')
// APP STATE
let modalResult = {}
let resultsJSON = []

// LISTENS FOR CLICK / ENTER KEY
buttons.forEach(button => {
  button.addEventListener('click', handleButtonClick)
})
input.addEventListener('keyup', e => {
  if (event.keyCode === 13) {
    e.preventDefault()
    handleButtonClick()
  }
})

// HANDLES CLICK EVENT
function handleButtonClick(event) {
  let searchParam = input.value
  input.value = ''
  fetchData(`https://images-api.nasa.gov/search?q=${searchParam}`)
}

function injectTemplate(index) {
  modalResult = resultsJSON[index]

  const template = `
  <div class="image-container">
      <img src="${modalResult.links[0].href}" alt="">
  </div>
  <div>
    <h1>${modalResult.data[0].title}</h1>
    <p>${modalResult.data[0].description}</p>
  </div>
  `
  modalContent.innerHTML = template
  modal.classList.add('modal-active')
}

// FETCH API DATA AND WAIT FOR RESPONSE
const fetchData = (url) => {
  results.innerHTML = ''
  fetch(url)
    .then((response) => {
      return response.json();
    })
    // HANDLES RETURNED DATA
    .then((data) => {

      if (!data.collection || data.collection.items.length < 1) {
        error.classList.add('show-error')
        return setTimeout(() => {
          error.classList.remove('show-error')
        }, 5000)
      }

      resultsJSON = data.collection.items.filter(x => x.links && x.data)
      resultsJSON.forEach(item => {
        //LIMIT DESCRIPTION TO 100 CHARACTERS
        let string = item.data[0].description
        let length = 100
        let trimmedString = string.substring(0, 100)
        //INJECTS INFORMATION
        const html = `
              <div class="item">
              <a><div class="image" style="background-image: url('${item.links[0].href}');"></div></a>
              <div class="item-info">
                <h4>${item.data[0].title}</h4>
                <p>${trimmedString + ' ...'}</p>
              </div>
              </div>
              `
        //APPENDS IMG, TITLE, DESCRIPTION TO THE DOM
        results.innerHTML += html

        // CHANGES CLASS NAME TO MAKE TOP NAV SHOW
        navContainer.className = 'top-nav-container'
        searchBarHeader.className = 'top-search-bar-header'
        headerTitle.className = 'top-header-title'
        searchBar.className = 'top-search-bar'
        input.className = 'top-input'
        buttons.className = 'top-button'
        paginationBtns.style.display = 'flex'
      })
      input.value = ''
      const items = document.querySelectorAll('.results .item a')

      //ADD CLICK EVENT TO EVERY RESULT DIV
      items.forEach((item, index) => {
        item.addEventListener('click', e => {
          toggleNoScroll(false)
          injectTemplate(index)
        })
      })

      // PAGINATION
      data.collection.links.forEach(link => {
        let btn = document.querySelector(`.${link.rel}`)
        btn.setAttribute('data-link', link.href)
      })
    });
}

if (fetchData === 0) {
  console.log('no data');
}

document.querySelector('.prev').addEventListener('click', event => {
  fetchData(event.target.dataset.link)
})
document.querySelector('.next').addEventListener('click', event => {
  fetchData(event.target.dataset.link)
})

// MODAL BUTTONS
modalButtons.forEach(button => {
  button.addEventListener('click', e => {
    let index = resultsJSON.findIndex(x => x === modalResult)
    if (button.className === 'forward') {
      if (index === resultsJSON.length - 1) {
        index = 0
      } else {
        index = index + 1
      }
      injectTemplate(index)
    } else {
      if (index === 0) {
        index = resultsJSON.length - 1
      } else {
        index = index - 1
      }
      injectTemplate(index)
    }
  })
})

const toggleNoScroll = (scrollable) => {
  if (scrollable) {
    body.classList.remove('no-scroll')
  } else {
    body.classList.add('no-scroll')
  }
}

// MODAL CLOSE
modalClose.addEventListener('click', e => {
  toggleNoScroll(true)
  modal.classList.remove('modal-active')
})
