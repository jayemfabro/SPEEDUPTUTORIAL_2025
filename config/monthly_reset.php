<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Monthly Statistics Reset Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration file contains settings for the monthly statistics
    | reset functionality.
    |
    */

    'enabled' => env('MONTHLY_RESET_ENABLED', true),
    
    'reset_day' => env('MONTHLY_RESET_DAY', 1), // First day of the month
    
    'reset_time' => env('MONTHLY_RESET_TIME', '01:00'), // 1:00 AM
    
    'archive_old_data' => env('ARCHIVE_OLD_DATA', true),
    
    'keep_cumulative_totals' => env('KEEP_CUMULATIVE_TOTALS', true),
    
    'notification_email' => env('RESET_NOTIFICATION_EMAIL', 'admin@speeduptutorial.com'),
    
    'backup_before_reset' => env('BACKUP_BEFORE_RESET', true),
    
    /*
    |--------------------------------------------------------------------------
    | Fields to Reset
    |--------------------------------------------------------------------------
    |
    | Define which student statistics should be reset monthly
    |
    */
    
    'reset_student_fields' => [
        'completed',
        'cancelled', 
        'absent_w_ntc_counted',
        'absent_w_ntc_not_counted',
        'absent_without_notice',
        'free_class_consumed',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Fields to Keep
    |--------------------------------------------------------------------------
    |
    | Define which student statistics should NOT be reset (cumulative data)
    |
    */
    
    'keep_student_fields' => [
        'purchased_class_regular',
        'purchased_class_premium', 
        'purchased_class_group',
        'free_classes',
        'class_left',
    ],
];