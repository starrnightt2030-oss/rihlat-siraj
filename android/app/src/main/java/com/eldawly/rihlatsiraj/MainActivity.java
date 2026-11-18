package com.eldawly.rihlatsiraj;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // ثبات المقاس حتى لو خط الموبايل مكبّر
        WebSettings ws = getBridge().getWebView().getSettings();
        ws.setTextZoom(100);
        ws.setSupportZoom(false);
        ws.setBuiltInZoomControls(false);
        ws.setDisplayZoomControls(false);
        ws.setMediaPlaybackRequiresUserGesture(false);
        getBridge().getWebView().setHorizontalScrollBarEnabled(false);
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
    }
}
