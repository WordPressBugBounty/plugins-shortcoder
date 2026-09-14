function sc_show_insert(shortcode = '', on_insert = null){
    var $ = jQuery;
    var insert_vars = window.SC_INSERT_VARS;
    var $popup = $('#sci_wrap');

    if(typeof insert_vars === 'undefined'){
        console.log('Cannot load shortcode insert window as the script is not loaded properly');
        return;
    }

    insert_vars.on_insert = on_insert;

    if($popup.length){
        $popup.show();
        sc_notify_insert(shortcode);
        return;
    }

    $('body').append('<div id="sci_wrap"><div id="sci_bg"></div><div id="sci_popup"><header><span id="sci_title"></span><span id="sci_close" title="Close"><span class="dashicons dashicons-no"></span></span></header><iframe></iframe></div></div>');

    $popup = $('#sci_wrap');
    $('#sci_title').text(insert_vars.popup_title);
    $('#sci_popup > iframe').attr('src', insert_vars.insert_page);
    $('#sci_close').on('click', sc_close_insert);

    insert_vars.popup_opened = true;
    insert_vars.iframe = $('#sci_popup > iframe');
    insert_vars.iframe.on('load', function(){
        sc_notify_insert(shortcode);
    });
}

function sc_close_insert(){
    jQuery('#sci_wrap').hide();
    window.SC_INSERT_VARS.popup_opened = false;
    window.SC_INSERT_VARS.on_insert = null;
}

function sc_notify_insert(shortcode){

    if(shortcode === false){
        return false;
    }

    var $iframe = window.SC_INSERT_VARS.iframe;
    var content_window = $iframe[0].contentWindow;

    content_window.postMessage(shortcode);

}

function sc_qt_show_insert(){
    sc_show_insert();
}

if(window.addEventListener){
    window.addEventListener('message', function(event){
        var data = event.data;
        var iframe = window.SC_INSERT_VARS && window.SC_INSERT_VARS.iframe;

        if(!data || !iframe || event.source !== iframe[0].contentWindow){
            return;
        }

        if(data.type === 'shortcoder_close'){
            sc_close_insert();
            return;
        }

        if(data.type !== 'shortcoder_insert'){
            return;
        }

        if(typeof window.SC_INSERT_VARS.on_insert === 'function' && window.SC_INSERT_VARS.on_insert(data.content) !== false){
            sc_close_insert();
            return;
        }

        if(typeof window.send_to_editor === 'function'){
            window.send_to_editor(data.content);
            sc_close_insert();
        }else{
            alert('Editor does not exist. Cannot insert shortcode !');
        }
    }, false);
}

if(window.addEventListener){
    window.addEventListener('load', function(){
        if( typeof QTags === 'function' ){
            QTags.addButton( 'QT_sc_insert', 'Shortcoder', sc_qt_show_insert );
        }
    });
}