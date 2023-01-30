async function displayTable () {
        const divTabels = document.querySelectorAll('#tabels li');
        divTabels.forEach(li => {
            li.addEventListener('click',() => {
                // clearing inputs for insert,delete etc.
                document.querySelector('#optionInputs').innerHTML = null;
                document.querySelector('#optionPick').selectedIndex = 0;

                const divQueryResult = document.querySelector('#queryResult');
                const tableRows = window.api.sendTable(li.innerText);

                let table = document.createElement('table');
                let caption = document.createElement('caption');
                let captionText = document.createTextNode(li.innerText);

                caption.appendChild(captionText);
                table.appendChild(caption);
                tableRows.then((rowsAndColumns) => {
                    let columns = rowsAndColumns.metaData;
                    let rows = rowsAndColumns.rows;
                    let tr = document.createElement('tr');
                    columns.forEach(val => {
                        let th = document.createElement('th');
                        let thVal = document.createTextNode(val.name);
                        th.appendChild(thVal);
                        tr.appendChild(th);
                        table.appendChild(tr);
                    });
                    let tbody = document.createElement('tbody');
                    table.appendChild(tbody)
                    rows.forEach(row => {
                        tr = document.createElement('tr');
                        row.forEach(val => {
                            let td = document.createElement('td');
                            let tdVal = document.createTextNode(val);
                            td.appendChild(tdVal);
                            tr.appendChild(td);
                            tbody.appendChild(tr);
                        })
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    divQueryResult.innerHTML = null;
                    divQueryResult.appendChild(table);
                });
            });
        });
}

export {displayTable};