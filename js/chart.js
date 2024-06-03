document.addEventListener('DOMContentLoaded', function () {
  am5.ready(function () {
    var rootDiv = document.getElementById('chartdiv')
    var root = am5.Root.new('chartdiv')
    root.setThemes([am5themes_Animated.new(root)])

    var map = createMap(root)
    var pointSeries = createPointSeries(root, map)
    var colorSet = am5.ColorSet.new(root, { step: 2 })

    setupMapEvents(map, pointSeries)
    addDataToSeries(pointSeries)
    map.appear(1000, 100)
    // Function to create the map
    function createMap(root) {
      return root.container.children.push(
        am5map.MapChart.new(root, {
          panX: 'none',
          panY: 'none',
          wheelX: 'none',
          wheelY: 'none',
          projection: am5map.geoNaturalEarth1(),
        })
      )
    }

    // Function to create point series
    function createPointSeries(root, map) {
      var polygonSeries = map.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_continentsLow,
          exclude: ['antarctica'],
          fill: am5.color(0xffffff),
          toggleKey: 'active',
          interactive: true,
        })
      )

      var pointSeries = map.series.push(
        am5map.MapPointSeries.new(root, {
          maskBullets: false,
        })
      )
      pointSeries.bullets.push(function (root, series, dataItem) {
        return createBullet(root, map, dataItem, colorSet)
      })

      return pointSeries
    }

    var modal = am5.Modal.new(root, {
      content: "<div id='modalContent'></div>",
    })

    var modalSetup = false
    var currentActiveBullet

    function openModal(title, value) {
      var modalContent = document.getElementById('modalContent')
      // Add Dynamic data from here
      modalContent.innerHTML = `
        <div>
          <h1>Latin America</h1>
          <p>
            Mankind FZ LLC -Dubai a wholly owned subsidiary of
            Mankind (International office @Dubai). Presence in 18
            markets globally with dedicated teams in 7 markets</p>
        </div>
        <h3>${title}</h3><p>${value}% of something.</p>
      `

      var cancelButton = document.createElement('button')
      cancelButton.value = 'x'
      cancelButton.classList.add('am5-modal-close')
      cancelButton.addEventListener('click', function () {
        modal.cancel()
        map.goHome()
        if (currentActiveBullet) {
          currentActiveBullet.set('active', false)
        }
      })

      modalContent.appendChild(cancelButton)

      modalSetup = true
      modal.open()

      setTimeout(() => {
        document.addEventListener('keydown', closeModalOnEsc)
        document.addEventListener('click', closeModalOnClickOutside)
      }, 100)
    }

    function closeModal() {
      if (modal) {
        map.goHome()
        modal.close()
        if (currentActiveBullet) {
          currentActiveBullet.set('active', false)
        }
        document.removeEventListener('click', closeModalOnClickOutside)
        document.removeEventListener('keydown', closeModalOnEsc)
      }
    }

    function closeModalOnClickOutside(event) {
      if (!document.querySelector('#modalContent').contains(event.target)) {
        closeModal()
      }
    }

    function closeModalOnEsc(event) {
      if (event.key === 'Escape') {
        closeModal()
      }
    }
    document
      .querySelector('.am5-modal')
      .classList.add('animate__animated,animate__fadeInRight,animate__delay-1s')
    modal.events.on('opened', function (ev) {
      document.querySelector('.am5-modal').classList.add('open')
      document.querySelector('#modalContent').classList.add('open')
      modal.getPrivate('curtain').classList.add('active')
      modal.getPrivate('wrapper').classList.add('active')
      modal.getPrivate('content').classList.add('active')
    })
    modal.events.on('closed', function (ev) {
      document.querySelector('.am5-modal').classList.remove('open')
    })
    // Function to setup map events
    function setupMapEvents(map, pointSeries) {
      map.chartContainer.get('background').events.on('click', function () {
        map.goHome()
        pointSeries.show()
        if (currentActiveBullet) {
          currentActiveBullet.set('active', false)
          closeModal()
        }
      })
    }

    // Function to add data to point series
    function addDataToSeries(pointSeries) {
      var data = [
        {
          title: 'United States',
          name: 'United States',
          latitude: 39.563353,
          longitude: -99.316406,
          width: 100,
          height: 100,
          value: 12,
        },
        {
          title: 'European Union',
          name: 'European Union',
          latitude: 50.896104,
          longitude: 19.160156,
          width: 50,
          height: 50,
          value: 15,
        },
        {
          title: 'Asia',
          name: 'Asia',
          latitude: 47.212106,
          longitude: 103.183594,
          width: 80,
          height: 80,
          value: 8,
        },
        {
          title: 'Africa',
          name: 'Africa',
          latitude: 11.081385,
          longitude: 21.621094,
          width: 50,
          height: 50,
          value: 5,
        },
      ]

      data.forEach(function (d) {
        pointSeries.data.push({
          geometry: { type: 'Point', coordinates: [d.longitude, d.latitude] },
          title: d.title,
          value: d.value,
        })
      })
    }

    // Function to create bullets
    function createBullet(root, map, dataItem, colorSet) {
      var value = dataItem.dataContext.value
      var coordinates = dataItem.dataContext.geometry.coordinates
      var title = dataItem.dataContext.title

      var container = am5.Container.new(root, {
        interactive: true,
        setStateOnChildren: true,
      })
      var color = colorSet.next()
      var radius = 15 + (value / 20) * 20

      var circle = container.children.push(
        am5.Circle.new(root, {
          radius: radius,
          fill: am5.color(0x0094d6),
          fillOpacity: 0.6,
          centerX: am5.p50,
          centerY: am5.p50,
          dy: -radius * 2,
          cursorOverStyle: 'pointer',
          toggleKey: 'active',
        })
      )

      circle.events.on('click', function () {
        if (!currentActiveBullet) {
          map.zoomToGeoPoint(
            { longitude: coordinates[0], latitude: coordinates[1] },
            1.1,
            true,
            1500
          )
          openModal(title, value)
        }
      })

      circle.states.create('hover', {
        fill: am5.color(0x081997),
        fillOpacity: 1,
        scale: 1.2,
      })

      circle.states.create('active', {
        fill: am5.color(0x081997),
        fillOpacity: 1,
      })

      circle.on('active', function (active, target) {
        if (currentActiveBullet) {
          currentActiveBullet.set('active', false)
        }
        if (active) {
          currentActiveBullet = target
        } else {
          currentActiveBullet = undefined
        }
      })

      container.children.push(
        am5.Line.new(root, {
          stroke: am5.color(0x000),
          height: 100,
          centerY: am5.p0,
          centerX: am5.p50,
          dy: -radius * 2,
          dx: 0,
        })
      )

      container.children.push(
        am5.Label.new(root, {
          text: dataItem.dataContext.title,
          fill: am5.color(0x000),
          fontWeight: '500',
          fontSize: '1em',
          centerY: am5.p0,
          dy: radius * 1,
          dx: 0,
        })
      )

      return am5.Bullet.new(root, {
        sprite: container,
      })
    }
  }) // end am5.ready()
})
