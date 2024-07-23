document.addEventListener("deviceready", onDeviceReady, false);

let activeContactId = 0;

function onDeviceReady() {
    findContact();

    document.querySelector("a[href='#homepage']").addEventListener("click", findContact);
    document.querySelector("#button-add").addEventListener("click", createContact);
}

function findContact() {
    let option = new ContactFindOptions();
    option.multiple = true;
    option.hasPhoneNumber = true;
    let fields = ['*'];
    navigator.contacts.find(fields, displayContacts, onContactError, option);
}

function displayContacts(contacts) {
    let listHtml = "";
    contacts.forEach(function(contact) {
        listHtml += `
            <li>
                <a href='#detailscontactpage' data-id='${contact.id}' class='allContact'>
                    <img src='img/contacts.jpeg' alt='contact'>
                    <h2>${contact.name?.givenName || ''} ${contact.name?.familyName || ''}</h2>
                    <p>${contact.phoneNumbers ? contact.phoneNumbers[0].value : ''}</p>
                </a>
            </li>
        `;
    });

    let contactList = document.querySelector("#contacList");
    contactList.innerHTML = listHtml;
    $(contactList).listview('refresh');

    document.querySelectorAll(".allContact").forEach(function(element) {
        element.addEventListener("click", function(event) {
            activeContactId = element.getAttribute('data-id'); 
            detailContact();
        });
    });
}

function createContact(event) {
    event.preventDefault();
    
    let form = document.querySelector("#addcontactform");
    let nom = form.querySelector("input[name='nom']").value;
    let prenom = form.querySelector("input[name='prenom']").value;
    let adresse = form.querySelector("input[name='address']").value;
    let numero = form.querySelector("input[name='numero']").value;

    if (!numero) {
        onContactError("Veuillez entrer le numéro");
    } else {
        let newContact = navigator.contacts.create();
        newContact.name = new ContactName();
        newContact.name.givenName = prenom || "";
        newContact.name.familyName = nom || "";

        let address = new ContactAddress();
        address.locality = adresse || "";
        newContact.addresses = [address];

        let phoneCateg = "Mobile";
        if (numero.startsWith("+33") || numero.startsWith("33")) {
            phoneCateg = "Domicile";
        }

        let phoneNumber = new ContactField(phoneCateg, numero, true);
        newContact.phoneNumbers = [phoneNumber];

        newContact.save(function() {
            resetInput();
            alert("Vous avez un nouveau contact");
            homePage();
        }, function(error) {
            onContactError("Erreur lors de la création du contact");
        });
    }
}

function detailContact() {
    let option = new ContactFindOptions();
    option.filter = activeContactId; 
    option.multiple = false;
    option.hasPhoneNumber = true;
    let fields = ['id', 'name', 'phoneNumbers', 'addresses'];

    navigator.contacts.find(fields, function(contacts) {
        let contact = contacts[0];
        if (contact) {
            const form = document.querySelector("#detailcontactform");
            form.querySelector("input[name='nom']").value = contact.name?.givenName || "";
            form.querySelector("input[name='prenom']").value = contact.name?.familyName || "";
            form.querySelector("input[name='address']").value = contact.addresses?.[0]?.locality || "";
            form.querySelector("input[name='numero']").value = contact.phoneNumbers?.[0]?.value || "";

            document.querySelector("#buton-update").addEventListener("click", updateContact);
            document.querySelector("#buton-delete").addEventListener("click", function(event) {
                event.preventDefault();
                if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
                    deleteContact();
                }
            });
        } else {
            onContactError("Erreur lors de la récupération de l'ID");
            homePage();
        }
    }, onContactError, option);
}

function updateContact(event) {
    event.preventDefault();

    const form = document.querySelector("#detailcontactform");
    const nom = form.querySelector("input[name='nom']").value;
    const prenom = form.querySelector("input[name='prenom']").value;
    const address = form.querySelector("input[name='address']").value;
    const numero = form.querySelector("input[name='numero']").value;

    let option = new ContactFindOptions();
    option.filter = activeContactId; 
    option.multiple = false;
    option.hasPhoneNumber = true;
    let fields = ['id', 'name', 'phoneNumbers', 'addresses'];

    navigator.contacts.find(fields, function(contacts) {
        let contact = contacts[0];
        if (contact) {
            contact.name.givenName = nom;
            contact.name.familyName = prenom;
            contact.addresses[0].locality = address;
            contact.phoneNumbers[0].value = numero;

            contact.save(function() {
                alert("Contact mis à jour avec succès.");
                homePage();
            }, onContactError);
        } else {
            onContactError("Erreur lors de la modification");
            homePage();
        }
    }, onContactError, option);
}

function deleteContact() {
    let option = new ContactFindOptions();
    option.multiple = false;
    option.filter = activeContactId; 
    option.hasPhoneNumber = true;
    let fields = ['id'];

    navigator.contacts.find(fields, function(contacts) {
        let contact = contacts[0];
        if (contact) {
            contact.remove(function() {
                alert("Contact supprimé avec succès.");
                homePage();
            }, onContactError);
        } else {
            onContactError("Contact introuvable");
            homePage();
        }
    }, onContactError, option);
}

function resetInput() {
    document.querySelectorAll("form").forEach(function(form) {
        form.reset();
    });
}

function onContactError(error) {
    alert("Erreur: " + error);
}

function homePage() {
    let link = document.querySelector("a[href='#homepage']");
    link.click();
}
