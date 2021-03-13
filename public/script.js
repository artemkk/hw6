document.addEventListener("submit", function (event) { // Assign listener to Submit button; following code creates table out of provided data
    
    event.preventDefault()

    var updateParams = document.getElementById("newExercise") // Use DOM 'getElementByID' method to access updateExercise.handlebars form 

    var req = new XMLHttpRequest() // Set up XMLHTTP request

    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) { // Add new info if status acceptable

            var exerRow = document.getElementById("workoutTable").insertRow(0)	// Most recent added first

            document.createElement('td').style.display = "none" // Hidden ID table row data cell
            exerRow.appendChild(document.createElement('td'))

            document.createElement('td').textContent = updateParams.elements.exercise.value // Exercise name table row data cell
            exerRow.appendChild(document.createElement('td'))

            document.createElement('td').textContent = updateParams.elements.reps.value // Rep number table row data cell
            exerRow.appendChild(document.createElement('td'))

            document.createElement('td').textContent = updateParams.elements.weight.value // Weight amount table row data cell
            exerRow.appendChild(document.createElement('td'))

            document.createElement('td').textContent = updateParams.elements.lbs.value // Unit table row data cell
            exerRow.appendChild(document.createElement('td'))

            document.createElement('td').textContent = updateParams.elements.date.value // Date table row data cell
            exerRow.appendChild(document.createElement('td'))

            exerRow.appendChild(document.createElement('td')) // Edit button table row data cell

            exerRow.appendChild(document.createElement('td')) // Delete button table row data cell

        }

        else {
            console.log('ERROR');
        }
    });

});

/*
References
XMLHTTP Load Event
https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/load_event
*/