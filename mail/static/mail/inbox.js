document.addEventListener('DOMContentLoaded', function() {
  // Elementos DOM
  const emailsView = document.querySelector('#emails-view');
  const composeView = document.querySelector('#compose-view');
  const emailView = document.querySelector('#email-view');
  
  // Estado global
  let currentMailbox = '';

  // Event listeners
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // Carregar inbox inicialmente
  load_mailbox('inbox');

  function compose_email() {
    showView(composeView);
    hideView(emailsView);
    hideView(emailView);
    
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  function send_email(event) {
    event.preventDefault();
    
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    const submitBtn = document.querySelector('#compose-form input[type="submit"]');
    const originalBtnText = submitBtn.value;
    
    // Feedback visual
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    fetch('/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => {
      if (response.status === 201) return response.json();
      return response.json().then(error => { throw new Error(error.error) });
    })
    .then(() => load_mailbox('sent'))
    .catch(error => {
      console.error('Send email error:', error);
      alert(`Error: ${error.message || 'Please check recipient emails'}`);
    })
    .finally(() => {
      submitBtn.value = originalBtnText;
      submitBtn.disabled = false;
    });
  }

  function load_mailbox(mailbox) {
    currentMailbox = mailbox;
    
    showView(emailsView);
    hideView(composeView);
    hideView(emailView);

    emailsView.innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
      <div class="loading">Loading emails...</div>
    `;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      let content = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
      
      if (emails.length === 0) {
        content += '<div class="no-emails">No emails found</div>';
        emailsView.innerHTML = content;
        return;
      }

      const container = document.createElement('div');
      container.className = 'mailbox-container';
      
      emails.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.className = `email ${email.read ? 'read' : 'unread'}`;
        emailElement.innerHTML = `
          <div class="email-header">
            <span class="sender">${mailbox === 'sent' ? 'To: ' + email.recipients.join(', ') : email.sender}</span>
            <span class="subject">${email.subject}</span>
            <span class="timestamp">${email.timestamp}</span>
          </div>
        `;
        emailElement.addEventListener('click', () => view_email(email.id));
        container.appendChild(emailElement);
      });
      
      emailsView.innerHTML = content;
      emailsView.appendChild(container);
    })
    .catch(error => {
      console.error('Load mailbox error:', error);
      emailsView.innerHTML += '<div class="error">Error loading emails</div>';
    });
  }

  function view_email(email_id) {
    showView(emailView);
    hideView(emailsView);
    hideView(composeView);
    
    emailView.innerHTML = '<div class="loading">Loading email...</div>';

    // Marcar como lido
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({read: true})
    });

    // Carregar detalhes do email
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      emailView.innerHTML = `
        <div class="email-details">
          <p><strong>From:</strong> ${email.sender}</p>
          <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
          <p><strong>Subject:</strong> ${email.subject}</p>
          <p><strong>Timestamp:</strong> ${email.timestamp}</p>
          
          <div class="email-actions">
            ${currentMailbox !== 'sent' ? `
              <button class="btn ${email.archived ? 'btn-success' : 'btn-warning'} archive-btn">
                ${email.archived ? 'Unarchive' : 'Archive'}
              </button>
            ` : ''}
            <button class="btn btn-primary reply-btn">Reply</button>
          </div>
          
          <hr>
          <div class="email-body">${email.body.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      // Botão Archive/Unarchive
      if (currentMailbox !== 'sent') {
        document.querySelector('.archive-btn').addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({archived: !email.archived})
          })
          .then(() => load_mailbox('inbox'));
        });
      }

      // Botão Reply
      document.querySelector('.reply-btn').addEventListener('click', () => {
        compose_email();
        
        // Pré-preencher formulário
        document.querySelector('#compose-recipients').value = email.sender;
        
        // Formatar assunto
        let replySubject = email.subject;
        if (!replySubject.startsWith('Re: ')) {
          replySubject = 'Re: ' + replySubject;
        }
        document.querySelector('#compose-subject').value = replySubject;
        
        // Formatar data conforme especificação
        const timestamp = new Date(email.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        });
        
        // Pré-preencher corpo
        document.querySelector('#compose-body').value = 
          `On ${formattedDate} ${email.sender} wrote:\n${email.body}\n\n`;
      });
    })
    .catch(error => {
      console.error('View email error:', error);
      emailView.innerHTML = '<div class="error">Error loading email</div>';
    })
  }

  // Funções auxiliares
  function showView(element) {
    element.style.display = 'block';
  }

  function hideView(element) {
    element.style.display = 'none';
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});