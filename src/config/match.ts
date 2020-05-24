
/**
 * Match configuration.
 * 
 * The settings in this file configure the way we matches are determined.
 */


export default () => ({

    matching: {

        /**
        * compatibilityScore configures the weight of each element of the compatibility score used
        * to determine matches.
        */
        compatibilityScore: {

            /**
             * The weight of each factor of the compatibility score. The higher the weight, the more 
             * important that factor is. 
             */
            weights: {
                sharedAvailability: 1,
                noPriorMatch: 2,
                matchDeadlineApproaching: 3
            }
        },
        
        /**
        * The number of days prior to a call a user must be matched.
        */

        matchByDaysPrior: 1,
    }
})