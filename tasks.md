 - Login Page
 - Register Page
 - Footer
 - Contact
 - 


 - Admin Dashboard / Staff Portal ?
 - News / Blogs Page ?
 - All Events Page
 - Scholarships & Donations
 - Committee Page
 - Careers & Mentorship Page
 - All Alumni Profiles' Page
 - Single Profile's Page
 - About Page (How the Association Started)
 - 


 - Admin Auth (Brian - 256705916931) through a whatsapp token sent to the Admin number.
 - On token Auth, the Admin device is then saved in the DB to always have full access rights. For a system set period.
 - On each trial view, a check is made to the DB for both device & token verification.
 - A) Admin can: ('/admin')
    - Generate sharable links by uique uuid.
    - View sharable links (active & inactive).
    - Revoke a sharable link's access (with a reason).
    - Once a new sharable link is shared to the same number, the old one is revoked.
    - Use Case:
        - Once a new link is genrated, it saved in the DB.
        - When it is shared with a contact, record is updated with contact number & contact name saved on it.
        - When the link is opened, record is updated with the device name & details.
        - On the next site visits, only allow access if the link is being opened from the device it linked OR else show a page of contact Vaalz Collections for more details.

    - Create new products.
    - Increase the number of currently available products (after a new shipment).
    - Record a new sell for record keeping & inventory management.
    - Give me more suggestion to implement a fully functional Inventory System for clothes / boutique business.

 - B) Users can: ('/')
 - View items from the link that they've received.
    - Admin multi selects items they are interested in sharing with a specific client & only those items are viewed by the client.
 - Look into the WhatsApp api. How to get an account's avatar & display it in the site.
 - Data is the new oil
 - 
