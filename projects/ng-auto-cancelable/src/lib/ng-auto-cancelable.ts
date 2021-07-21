import { Subscription, timer } from "rxjs";

const cancelOnDestroyMap: Map<Object, Array<CallableFunction>> = new Map();

/**
 * HttpClient request auto cancel on component destroy with some addition benefits.
 * 
 * @param takeLatest previous request will cancel when call same type of request again.
 * @param autoCancelTimeout request auto cancel on given timeout value.
 */
export function ngAutoCancelable(takeLatest = true, autoCancelTimeout?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // store original function for future use
    const original = descriptor.value;
    const originalOnDestroy = target.ngOnDestroy;
    let subscription: Subscription;
    let timerSubscription: Subscription;

    // override original function body
    descriptor.value = function autCancelable(...args: any) {

      if (takeLatest && subscription) {
        cancelRequest();
      }

      /**
       * call original function
       */
      subscription = original.apply(this, args);

      /**
       * Check function return type is Subscription or not
       */
      if (!(subscription instanceof Subscription)) {
        try {
          throw new Error(`function ${original.name} must be return a type of Subscription`);
        } catch (error) {
          console.error(error);
          return subscription;
        }
      }

      if (autoCancelTimeout) {
        if (!Number.isNaN(autoCancelTimeout)){
          scheduleTimer();
        } else {
          console.error('autoCancelTimeout must be a number type');
        }
      }

      return subscription;
    };

    /**
     * Schedule new timer basis of autoCancelTimeout value.
     */
    function scheduleTimer() {
      timerSubscription = timer(autoCancelTimeout).subscribe(() => {
        cancelRequest();
      });
    }

    /**
     * Cancel http request.
     */
    function cancelRequest() {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
      clearTimer();
    }

    /**
     * update cancelRequest map object.
     */
    function updateCancelMap() {
      const targetMap = cancelOnDestroyMap.get(target) || [];
      targetMap.push(cancelRequest);
      cancelOnDestroyMap.set(target, targetMap);
    }

    /**
     * Auto cancel timer clear if any.
     */
    function clearTimer() {
      if (timerSubscription && !timerSubscription.closed) {
        timerSubscription.unsubscribe();
      }
    }

    /**
     * Attached ngOnDestroy component lifecycle function inside target component.
     */
    if (!cancelOnDestroyMap.has(target)) {
      Object.defineProperty(target, "ngOnDestroy", {
        value: function ngOnDestroy() {
          
          // cancel all the request associate with the component.
          for (const cancelRequestRef of cancelOnDestroyMap.get(target) || []) {
            cancelRequestRef();
          }
          cancelOnDestroyMap.delete(target);

          if (typeof originalOnDestroy === 'function') {
            originalOnDestroy.apply(this);
          }
        }
      });
    }

    updateCancelMap();
    
    // return descriptor with new value
    return descriptor;
  };
}
