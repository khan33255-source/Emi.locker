package com.emilocker.mdm;

import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.PersistableBundle;
import android.widget.Toast;

/**
 * Faisal's Emi.locker DeviceAdminReceiver
 * This class handles the MDM handshake and persistent enforcement.
 */
public class DeviceAdminReceiver extends android.app.admin.DeviceAdminReceiver {

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Toast.makeText(context, "Emi.locker Protection Active", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName componentName = getComponentName(context);

        // PERSISTENT LOCK: Establish Kiosk Mode
        dpm.setLockTaskPackages(componentName, new String[]{context.getPackageName()});
        
        // Disable Factory Reset protection bypass
        dpm.setKeyguardDisabledFeatures(componentName, DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_ALL);
        
        // Start main lock interface
        Intent launchIntent = new Intent(context, LockActivity.class);
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(launchIntent);
    }

    public static ComponentName getComponentName(Context context) {
        return new ComponentName(context.getApplicationContext(), DeviceAdminReceiver.class);
    }
}
