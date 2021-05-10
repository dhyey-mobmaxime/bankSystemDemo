$('#transaction_from').datepicker({ dateFormat: 'yy-mm-dd' });
$('#transaction_to').datepicker({ dateFormat: 'yy-mm-dd' });

$("form[name='debitForm']").validate({
    rules: {
        amount: {
            required: true,
            number: true,
        },
    },
    messages: {
            amount: {
            required: "Please provide a amount",
                minlength: "Only digits allowed"
        },
    },
    submitHandler: function(form) {
        form.submit();
    }
});

$("form[name='creditForm']").validate({
    rules: {
        amount: {
            required: true,
            number: true,
        },
    },
    messages: {
        amount: {
            required: "Please provide a amount",
            minlength: "Only digits allowed"
        },
    },
    submitHandler: function(form) {
        form.submit();
    }
});

$("form[name='addcustomer']").validate({
    rules: {
        firstName: "required",
        lastName: "required",
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minlength: 6
        },
        cpassword: {
            required: true,
            minlength: 6,
            equalTo: "#password",
        },
    },
    messages: {
        firstName: "Please enter your firstname",
        lastName: "Please enter your lastname",
        password: {
            required: "Please provide a password",
            minlength: "Your password must be at least 5 characters long"
        },
        cpassword: {
            required: "Please provide a password",
            minlength: "Your password must be at least 5 characters long",
            equalTo: "Please enter the same password as above",
        },
        email: "Please enter a valid email address"
    },
    submitHandler: function(form) {
        form.submit();
    }
});


var TransactionTable = $('#user_listing').DataTable({
    dom: 'Bfrtip',
    buttons: [
        { extend: 'pdf', className: 'btn btn-danger' },
        { extend: 'excel', className: 'btn btn-success' },
        // 'copy', 'csv', 'excel', 'pdf', 'print'
    ],
    initComplete: function() {
        var $buttons = $('.dt-buttons').hide();
        $('#exportLinkbutton').on('change', function() {
            var btnClass = $(this).find(":selected")[0].id
                ? '.buttons-' + $(this).find(":selected")[0].id
                : null;
            if (btnClass) $buttons.find(btnClass).click();
        })
    } ,
    "language": {
        "emptyTable": "No Data Found !!!"
    },
    "processing": true,
    "searching": true,
    "lengthChange": true,
    "responsive": true,
    "bSort": true,
    "infoEmpty": 'No records available',

    "ajax": {
        // "url": "{% url 'customer:transactionsListingAPi' %}",
        "url": "/api/transactions",
        "type": "get"
    },

    "columns": [
        {"data": "id", "title": "ID"},
        {"data": "firstName", "title": "First Name"},
        {"data": "lastName", "title": "Last Name"},
        {"data": "accountNumber", "title": "Account Number"},
        {"data": "transactionType", "title": "Transaction Type"},
        {"data": "amount", "title": "Amount"},
        {"data" : "time", "title":"Time"},

    ]
});

$('#transactionSubmit').click(function (event) {

    var user = $('#selectedUser').val();
    var dateFrom = $('#transaction_from').val();
    var dateTo = $('#transaction_to').val();
    $.ajax({
        url: "/api/transactions?dateFrom=" + dateFrom  + "&dateTo=" + dateTo  + "&userid=" + user,
        type : 'get',

        success: function(data){
            TransactionTable.clear().draw();
            TransactionTable.rows.add(data.data).draw();
        },
    });

});